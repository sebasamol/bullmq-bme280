import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue('bme280', { connection });

(async () => {
  await queue.add('read-sensor', {
    temperature: 23.4,
    humidity: 58
  });
  console.log('📤 Zadanie dodane do kolejki');
})();
