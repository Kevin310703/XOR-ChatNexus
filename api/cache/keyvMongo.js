import KeyvMongo from '@keyv/mongo';
import { logger } from '../config/index.js';

const { MONGO_URI } = process.env ?? {};

const keyvMongo = new KeyvMongo(MONGO_URI, { collection: 'logs' });
keyvMongo.on('error', (err) => logger.error('KeyvMongo connection error:', err));

export default keyvMongo;
