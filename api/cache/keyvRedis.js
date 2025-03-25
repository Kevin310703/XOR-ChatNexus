const fs = require('fs');
const { createClient } = require('redis');
const Keyv = require('keyv');
const { isEnabled } = require('~/server/utils');
const logger = require('~/config/winston');

const {
  REDIS_URI,
  USE_REDIS,
  USE_REDIS_CLUSTER,
  REDIS_CA,
  REDIS_KEY_PREFIX,
  REDIS_MAX_LISTENERS,
} = process.env;

let keyvRedis;
const redis_prefix = REDIS_KEY_PREFIX || '';
const redis_max_listeners = Number(REDIS_MAX_LISTENERS) || 10;

function parseRedisURI(uri) {
  const regex = /^(?:(?<scheme>\w+):\/\/)?(?:(?<user>[^:@]+)(?::(?<password>[^@]+))?@)?(?<host>[\w.-]+)(?::(?<port>\d{1,5}))?$/;
  const match = uri.match(regex);

  if (match) {
    const { scheme, user, password, host, port } = match.groups;
    return {
      scheme: scheme || 'redis',
      user: user || 'default',
      password: password || null,
      host: host || null,
      port: port || 6379,
    };
  }
  return null;
}

async function initializeRedis() {
  if (!REDIS_URI || !isEnabled(USE_REDIS)) {
    logger.info('[Optional] Redis not initialized. Note: Redis support is experimental.');
    return;
  }

  let redisClient;
  let keyvOpts = {
    namespace: redis_prefix,
  };

  // Cấu hình TLS
  let redisOptions = { tls: {} }; // Kích hoạt TLS mặc định cho Redis Cloud
  if (REDIS_CA) {
    try {
      if (fs.existsSync(REDIS_CA)) {
        redisOptions.tls.ca = fs.readFileSync(REDIS_CA);
        logger.info(`Loaded Redis CA certificate from ${REDIS_CA}`);
      } else {
        logger.warn(`Redis CA certificate file not found at ${REDIS_CA}. Proceeding without CA.`);
      }
    } catch (error) {
      logger.error(`Failed to load Redis CA certificate from ${REDIS_CA}: ${error.message}`);
      logger.warn('Proceeding without CA certificate.');
    }
  }

  try {
    if (isEnabled(USE_REDIS_CLUSTER)) {
      const hosts = REDIS_URI.split(',').map((item) => {
        const parsed = parseRedisURI(item.trim());
        return {
          url: `${parsed.scheme}://${parsed.user}:${parsed.password || ''}@${parsed.host}:${parsed.port}`,
        };
      });
      redisClient = createClient({
        urls: hosts.map((h) => h.url),
        ...redisOptions,
      });
    } else {
      const parsedURI = parseRedisURI(REDIS_URI);
      if (!parsedURI) throw new Error('Invalid REDIS_URI format');
      redisClient = createClient({
        url: `${parsed.scheme}://${parsed.user}:${parsed.password || ''}@${parsed.host}:${parsed.port}`,
        ...redisOptions,
      });
    }

    // Xử lý sự kiện lỗi
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err.message);
    });

    // Kết nối tới Redis
    await redisClient.connect();
    logger.info('Redis client connected successfully.');

    // Kiểm tra trạng thái kết nối
    const pingResult = await redisClient.ping();
    logger.info(`Redis ping result: ${pingResult}`);

    // Khởi tạo Keyv trực tiếp với client Redis
    keyvRedis = new Keyv({
      store: redisClient,
      ...keyvOpts,
    });
    logger.info('Keyv initialized successfully with Redis client.');

    keyvRedis.on('error', (err) => logger.error('Keyv connection error:', err));
    keyvRedis.setMaxListeners(redis_max_listeners);

    // Kiểm tra Keyv bằng cách set/get một giá trị
    await keyvRedis.set('test-key', 'test-value', 10000); // TTL: 10s
    const testValue = await keyvRedis.get('test-key');
    logger.info(`Keyv test result: ${testValue}`);

    logger.info(
      '[Optional] Redis initialized. Note: Redis support is experimental. If you have issues, disable it. Cache needs to be flushed for values to refresh.',
    );
  } catch (error) {
    logger.error('Failed to initialize Redis:', error.stack || error.message);
    keyvRedis = null; // Đặt lại nếu lỗi
  }
}

// Gọi hàm khởi tạo Redis khi module được tải
initializeRedis().catch((err) => {
  logger.error('Error during Redis initialization:', err.stack || err.message);
});

module.exports = keyvRedis;