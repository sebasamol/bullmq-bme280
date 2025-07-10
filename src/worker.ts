import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker('bme280', async (job) => {
  console.log('📥 Przetwarzam zadanie:', job.name, job.data);
}, { connection });

worker.on('completed', (job) => {
  console.log(`✅ Zadanie ${job.id} zakończone`);
});
