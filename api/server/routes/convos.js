const multer = require('multer');
const express = require('express');
const axios = require('axios');
const { CacheKeys, EModelEndpoint } = require('librechat-data-provider');
const { getConvosByPage, deleteConvos, getConvo, saveConvo } = require('~/models/Conversation');
const { forkConversation, duplicateConversation } = require('~/server/utils/import/fork');
const { storage, importFileFilter } = require('~/server/routes/files/multer');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const { importConversations } = require('~/server/utils/import');
const { createImportLimiters } = require('~/server/middleware');
const { deleteToolCalls } = require('~/models/ToolCall');
const getLogStores = require('~/cache/getLogStores');
const { sleep } = require('~/server/utils');
const { logger } = require('~/config');
const assistantClients = {
  [EModelEndpoint.azureAssistants]: require('~/server/services/Endpoints/azureAssistants'),
  [EModelEndpoint.assistants]: require('~/server/services/Endpoints/assistants'),
};

const router = express.Router();
router.use(requireJwtAuth);

router.get('/', async (req, res) => {
  let pageNumber = req.query.pageNumber || 1;
  pageNumber = parseInt(pageNumber, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  let pageSize = req.query.pageSize || 25;
  pageSize = parseInt(pageSize, 10);

  if (isNaN(pageSize) || pageSize < 1) {
    return res.status(400).json({ error: 'Invalid page size' });
  }
  const isArchived = req.query.isArchived === 'true';
  let tags;
  if (req.query.tags) {
    tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
  } else {
    tags = undefined;
  }

  res.status(200).send(await getConvosByPage(req.user.id, pageNumber, pageSize, isArchived, tags));
});

router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const convo = await getConvo(req.user.id, conversationId);

  if (convo) {
    res.status(200).json(convo);
  } else {
    res.status(404).end();
  }
});

router.post('/gen_title', async (req, res) => {
  const { conversationId, messages: providedMessages } = req.body;
  console.log('Conversation ID:', conversationId);

  if (!conversationId) {
    return res.status(400).json({ message: 'conversationId is required' });
  }

  // Lấy hội thoại từ MongoDB và populate messages
  const existingConvo = await getConvo(req.user.id, conversationId, true);
  const messages = providedMessages && Array.isArray(providedMessages) && providedMessages.length > 0
    ? providedMessages
    : existingConvo?.messages?.map(msg => ({
        role: msg.isCreatedByUser ? 'user' : (msg.sender || 'assistant'), // Ưu tiên sender, nếu không có thì mặc định 'assistant'
        content: msg.text || (msg.content && msg.content.length > 0 ? msg.content[0].text : '') // Lấy từ text hoặc content
      })) || [];

  // Kiểm tra messages có nội dung hợp lệ không
  const validMessages = messages.filter(msg => msg.role && msg.content);
  console.log('Valid Messages:', validMessages);

  if (validMessages.length === 0) {
    return res.status(400).json({ message: 'Valid messages are required to generate title' });
  }

  try {
    let title = existingConvo?.title || 'New Chat';
    console.log('Title:', title);

    if (!title || title === 'New Chat') {
      // Gọi FastAPI để tạo tiêu đề
      const response = await axios.post('https://chat.xgpt.io.vn:5393/v1/title', {
        messages: validMessages,
        max_tokens: 10,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer dummy`, // Thay bằng API key thực tế
          'Content-Type': 'application/json',
        },
      });

      title = response.data.title;
      console.log('Generated title from FastAPI:', title);

      // Cập nhật tiêu đề vào MongoDB
      if (title) {
        await saveConvo(req, {
          conversationId,
          title,
        }, { context: `POST /api/convos/gen_title ${conversationId}` });
        console.log('Title updated in MongoDB:', title);
      }
    } else {
      console.log('Using existing title:', title);
    }

    if (title) {
      res.status(200).json({ title });
    } else {
      res.status(404).json({
        message: 'Title not found or method not implemented for the conversation\'s endpoint',
      });
    }
  } catch (error) {
    logger.error('Error generating or saving title:', error.message);
    res.status(500).json({ message: 'Failed to generate or save title' });
  }
});

router.post('/clear', async (req, res) => {
  let filter = {};
  const { conversationId, source, thread_id, endpoint } = req.body.arg;
  if (conversationId) {
    filter = { conversationId };
  }

  if (source === 'button' && !conversationId) {
    return res.status(200).send('No conversationId provided');
  }

  if (
    typeof endpoint != 'undefined' &&
    Object.prototype.propertyIsEnumerable.call(assistantClients, endpoint)
  ) {
    /** @type {{ openai: OpenAI}} */
    const { openai } = await assistantClients[endpoint].initializeClient({ req, res });
    try {
      const response = await openai.beta.threads.del(thread_id);
      logger.debug('Deleted OpenAI thread:', response);
    } catch (error) {
      logger.error('Error deleting OpenAI thread:', error);
    }
  }

  // for debugging deletion source
  // logger.debug('source:', source);

  try {
    const dbResponse = await deleteConvos(req.user.id, filter);
    await deleteToolCalls(req.user.id, filter.conversationId);
    res.status(201).json(dbResponse);
  } catch (error) {
    logger.error('Error clearing conversations', error);
    res.status(500).send('Error clearing conversations');
  }
});

router.post('/update', async (req, res) => {
  const update = req.body.arg;

  if (!update.conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }

  try {
    const dbResponse = await saveConvo(req, update, {
      context: `POST /api/convos/update ${update.conversationId}`,
    });
    res.status(201).json(dbResponse);
  } catch (error) {
    logger.error('Error updating conversation', error);
    res.status(500).send('Error updating conversation');
  }
});

const { importIpLimiter, importUserLimiter } = createImportLimiters();
const upload = multer({ storage: storage, fileFilter: importFileFilter });

/**
 * Imports a conversation from a JSON file and saves it to the database.
 * @route POST /import
 * @param {Express.Multer.File} req.file - The JSON file to import.
 * @returns {object} 201 - success response - application/json
 */
router.post(
  '/import',
  importIpLimiter,
  importUserLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      /* TODO: optimize to return imported conversations and add manually */
      await importConversations({ filepath: req.file.path, requestUserId: req.user.id });
      res.status(201).json({ message: 'Conversation(s) imported successfully' });
    } catch (error) {
      logger.error('Error processing file', error);
      res.status(500).send('Error processing file');
    }
  },
);

/**
 * POST /fork
 * This route handles forking a conversation based on the TForkConvoRequest and responds with TForkConvoResponse.
 * @route POST /fork
 * @param {express.Request<{}, TForkConvoResponse, TForkConvoRequest>} req - Express request object.
 * @param {express.Response<TForkConvoResponse>} res - Express response object.
 * @returns {Promise<void>} - The response after forking the conversation.
 */
router.post('/fork', async (req, res) => {
  try {
    /** @type {TForkConvoRequest} */
    const { conversationId, messageId, option, splitAtTarget, latestMessageId } = req.body;
    const result = await forkConversation({
      requestUserId: req.user.id,
      originalConvoId: conversationId,
      targetMessageId: messageId,
      latestMessageId,
      records: true,
      splitAtTarget,
      option,
    });

    res.json(result);
  } catch (error) {
    logger.error('Error forking conversation:', error);
    res.status(500).send('Error forking conversation');
  }
});

router.post('/duplicate', async (req, res) => {
  const { conversationId, title } = req.body;

  try {
    const result = await duplicateConversation({
      userId: req.user.id,
      conversationId,
      title,
    });
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error duplicating conversation:', error);
    res.status(500).send('Error duplicating conversation');
  }
});

module.exports = router;
