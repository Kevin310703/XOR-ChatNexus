import { Cluster } from 'ioredis';
const { REDIS_URI } = process.env ?? {};
const redis = new Cluster(REDIS_URI);

export default redis;
