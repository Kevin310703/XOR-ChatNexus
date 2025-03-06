import { promises as _promises, existsSync, mkdirSync, readFile } from 'fs';
import { extname, join, basename, posix, resolve as _resolve } from 'path';
import sharp from 'sharp';
import resize from '../images/resize';
const { resizeImageBuffer } = resize;
import _default from '~/models/userMethods';
const { updateUser } = _default;
import __default from '~/models/File';
const { updateFile } = __default;

/**
 * Converts an image file to the target format. The function first resizes the image based on the specified
 * resolution.
 *
 * If the original image is already in target format, it writes the resized image back. Otherwise,
 * it converts the image to target format before saving.
 *
 * The original image is deleted after conversion.
 * @param {Object} params - The params object.
 * @param {Object} params.req - The request object from Express. It should have a `user` property with an `id`
 *                       representing the user, and an `app.locals.paths` object with an `imageOutput` path.
 * @param {Express.Multer.File} params.file - The file object, which is part of the request. The file object should
 *                                     have a `path` property that points to the location of the uploaded file.
 * @param {string} params.file_id - The file ID.
 * @param {EModelEndpoint} params.endpoint - The params object.
 * @param {string} [params.resolution='high'] - Optional. The desired resolution for the image resizing. Default is 'high'.
 *
 * @returns {Promise<{ filepath: string, bytes: number, width: number, height: number}>}
 *          A promise that resolves to an object containing:
 *            - filepath: The path where the converted image is saved.
 *            - bytes: The size of the converted image in bytes.
 *            - width: The width of the converted image.
 *            - height: The height of the converted image.
 */
async function uploadLocalImage({ req, file, file_id, endpoint, resolution = 'high' }) {
  const inputFilePath = file.path;
  const inputBuffer = await _promises.readFile(inputFilePath);
  const {
    buffer: resizedBuffer,
    width,
    height,
  } = await resizeImageBuffer(inputBuffer, resolution, endpoint);
  const extension = extname(inputFilePath);

  const { imageOutput } = req.app.locals.paths;
  const userPath = join(imageOutput, req.user.id);

  if (!existsSync(userPath)) {
    mkdirSync(userPath, { recursive: true });
  }

  const fileName = `${file_id}__${basename(inputFilePath)}`;
  const newPath = join(userPath, fileName);
  const targetExtension = `.${req.app.locals.imageOutputType}`;

  if (extension.toLowerCase() === targetExtension) {
    const bytes = Buffer.byteLength(resizedBuffer);
    await _promises.writeFile(newPath, resizedBuffer);
    const filepath = posix.join('/', 'images', req.user.id, basename(newPath));
    return { filepath, bytes, width, height };
  }

  const outputFilePath = newPath.replace(extension, targetExtension);
  const data = await sharp(resizedBuffer).toFormat(req.app.locals.imageOutputType).toBuffer();
  await _promises.writeFile(outputFilePath, data);
  const bytes = Buffer.byteLength(data);
  const filepath = posix.join('/', 'images', req.user.id, basename(outputFilePath));
  await _promises.unlink(inputFilePath);
  return { filepath, bytes, width, height };
}

/**
 * Encodes an image file to base64.
 * @param {string} imagePath - The path to the image file.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded image data.
 */
function encodeImage(imagePath) {
  return new Promise((resolve, reject) => {
    readFile(imagePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString('base64'));
      }
    });
  });
}

/**
 * Local: Updates the file and encodes the image to base64,
 * for image payload handling: tuple order of [filepath, base64].
 * @param {Object} req - The request object.
 * @param {MongoFile} file - The file object.
 * @returns {Promise<[MongoFile, string]>} - A promise that resolves to an array of results from updateFile and encodeImage.
 */
async function prepareImagesLocal(req, file) {
  const { publicPath, imageOutput } = req.app.locals.paths;
  const userPath = join(imageOutput, req.user.id);

  if (!existsSync(userPath)) {
    mkdirSync(userPath, { recursive: true });
  }
  const filepath = join(publicPath, file.filepath);

  const promises = [];
  promises.push(updateFile({ file_id: file.file_id }));
  promises.push(encodeImage(filepath));
  return await Promise.all(promises);
}

/**
 * Uploads a user's avatar to local server storage and returns the URL.
 * If the 'manual' flag is set to 'true', it also updates the user's avatar URL in the database.
 *
 * @param {object} params - The parameters object.
 * @param {Buffer} params.buffer - The Buffer containing the avatar image.
 * @param {string} params.userId - The user ID.
 * @param {string} params.manual - A string flag indicating whether the update is manual ('true' or 'false').
 * @returns {Promise<string>} - A promise that resolves with the URL of the uploaded avatar.
 * @throws {Error} - Throws an error if Firebase is not initialized or if there is an error in uploading.
 */
async function processLocalAvatar({ buffer, userId, manual }) {
  const userDir = _resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'client',
    'public',
    'images',
    userId,
  );

  const fileName = `avatar-${new Date().getTime()}.png`;
  const urlRoute = `/images/${userId}/${fileName}`;
  const avatarPath = join(userDir, fileName);

  await _promises.mkdir(userDir, { recursive: true });
  await _promises.writeFile(avatarPath, buffer);

  const isManual = manual === 'true';
  let url = `${urlRoute}?manual=${isManual}`;

  if (isManual) {
    await updateUser(userId, { avatar: url });
  }

  return url;
}

export default { uploadLocalImage, encodeImage, prepareImagesLocal, processLocalAvatar };
