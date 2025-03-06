import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import multer, { diskStorage } from 'multer';
import { fileConfig as defaultFileConfig, mergeFileConfig } from 'librechat-data-provider';
import { sanitizeFilename } from '~/server/utils/handleText';
import { getCustomConfig } from '~/server/services/Config';

const storage = diskStorage({
  destination: function (req, file, cb) {
    const outputPath = join(req.app.locals.paths.uploads, 'temp', req.user.id);
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
    }
    cb(null, outputPath);
  },
  filename: function (req, file, cb) {
    req.file_id = randomUUID();
    file.originalname = decodeURIComponent(file.originalname);
    const sanitizedFilename = sanitizeFilename(file.originalname);
    cb(null, sanitizedFilename);
  },
});

const importFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json') {
    cb(null, true);
  } else if (extname(file.originalname).toLowerCase() === '.json') {
    cb(null, true);
  } else {
    cb(new Error('Only JSON files are allowed'), false);
  }
};

/**
 *
 * @param {import('librechat-data-provider').FileConfig | undefined} customFileConfig
 */
const createFileFilter = (customFileConfig) => {
  /**
   * @param {ServerRequest} req
   * @param {Express.Multer.File}
   * @param {import('multer').FileFilterCallback} cb
   */
  const fileFilter = (req, file, cb) => {
    if (!file) {
      return cb(new Error('No file provided'), false);
    }

    if (req.originalUrl.endsWith('/speech/stt') && file.mimetype.startsWith('audio/')) {
      return cb(null, true);
    }

    const endpoint = req.body.endpoint;
    const supportedTypes =
      customFileConfig?.endpoints?.[endpoint]?.supportedMimeTypes ??
      customFileConfig?.endpoints?.default.supportedMimeTypes ??
      defaultFileConfig?.endpoints?.[endpoint]?.supportedMimeTypes;

    if (!defaultFileConfig.checkType(file.mimetype, supportedTypes)) {
      return cb(new Error('Unsupported file type: ' + file.mimetype), false);
    }

    cb(null, true);
  };

  return fileFilter;
};

const createMulterInstance = async () => {
  const customConfig = await getCustomConfig();
  const fileConfig = mergeFileConfig(customConfig?.fileConfig);
  const fileFilter = createFileFilter(fileConfig);
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: fileConfig.serverFileSizeLimit },
  });
};

export default { createMulterInstance, storage, importFileFilter };
