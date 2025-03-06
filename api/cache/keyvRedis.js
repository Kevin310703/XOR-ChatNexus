import { readFileSync } from 'fs';
import { Cluster } from 'ioredis';
import KeyvRedis from '@keyv/redis';
import { isEnabled } from '../server/utils/index.js';
import { error, info } from '../config/winston.js';

const { REDIS_URI, USE_REDIS, USE_REDIS_CLUSTER, REDIS_CA, REDIS_KEY_PREFIX, REDIS_MAX_LISTENERS } =
  process.env;

let keyvRedis;
const redis_prefix = REDIS_KEY_PREFIX || '';
const redis_max_listeners = Number(REDIS_MAX_LISTENERS) || 10;

function mapURI(uri) {
  const regex =
    /^(?:(?<scheme>\w+):\/\/)?(?:(?<user>[^:@]+)(?::(?<password>[^@]+))?@)?(?<host>[\w.-]+)(?::(?<port>\d{1,5}))?$/;
  const match = uri.match(regex);

  if (match) {
    const { scheme, user, password, host, port } = match.groups;

    return {
      scheme: scheme || 'none',
      user: user || null,
      password: password || null,
      host: host || null,
      port: port || null,
    };
  } else {
    const parts = uri.split(':');
    if (parts.length === 2) {
      return {
        scheme: 'none',
        user: null,
        password: null,
        host: parts[0],
        port: parts[1],
      };
    }

    return {
      scheme: 'none',
      user: null,
      password: null,
      host: uri,
      port: null,
    };
  }
}

if (REDIS_URI && isEnabled(USE_REDIS)) {
  let redisOptions = null;
  let keyvOpts = {
    useRedisSets: false,
    keyPrefix: redis_prefix,
  };

  if (REDIS_CA) {
    const ca = readFileSync(REDIS_CA);
    redisOptions = { tls: { ca } };
  }

  if (isEnabled(USE_REDIS_CLUSTER)) {
    const hosts = REDIS_URI.split(',').map((item) => {
      var value = mapURI(item);

      return {
        host: value.host,
        port: value.port,
      };
    });
    const cluster = new Cluster(hosts, { redisOptions });
    keyvRedis = new KeyvRedis(cluster, keyvOpts);
  } else {
    keyvRedis = new KeyvRedis(REDIS_URI, keyvOpts);
  }
  keyvRedis.on('error', (err) => error('KeyvRedis connection error:', err));
  keyvRedis.setMaxListeners(redis_max_listeners);
  info(
    '[Optional] Redis initialized. Note: Redis support is experimental. If you have issues, disable it. Cache needs to be flushed for values to refresh.',
  );
} else {
  info('[Optional] Redis not initialized. Note: Redis support is experimental.');
}

export default keyvRedis;
