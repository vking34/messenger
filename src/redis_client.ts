import redis from 'redis';
import {promisify} from 'util';
const redis_client = redis.createClient(process.env.REDIS_URL);

redis_client.on('connect', () => {
     console.log('redis connected!');
     
})

// module.exports = redis_client;
export default {
     ...redis_client,
     getAsync: promisify(redis_client.get).bind(redis_client),
     setAsync: promisify(redis_client.set).bind(redis_client),
     keysAsync: promisify(redis_client.keys).bind(redis_client),
};