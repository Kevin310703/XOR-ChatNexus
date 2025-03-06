import { Router } from 'express';
import controllers from '~/server/controllers/assistants/v1';

const router = Router();

/**
 * Returns a list of the user's assistant documents (metadata saved to database).
 * @route GET /assistants/documents
 * @returns {AssistantDocument[]} 200 - success response - application/json
 */
router.get('/', controllers.getAssistantDocuments);

export default router;
