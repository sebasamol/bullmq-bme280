import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue('bme280', { connection });

(async () => {
  await queue.add('read-sensor', {}, {
    repeat: {
      pattern: '0-23 * * * * *' // every minute
    }
  });
})();

console.log('📤 Zadanie cykliczne dodane do kolejki');
