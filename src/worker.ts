import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Store sensor data in memory as separate arrays
let temperatureArray: number[] = [];
let humidityArray: number[] = [];
let pressureArray: number[] = [];
let timestampArray: string[] = [];

const worker = new Worker('bme280', async (job) => {
  const res = await fetch('http://192.168.1.100:5000/api/bme280');
  const sensorData = await res.json();
  
  console.log('📥 Przetwarzam zadanie:', job.name, job.data);
  console.log('📊 Dane z czujnika:', sensorData);
  
  // Extract timestamp
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Add values to arrays
  temperatureArray.push(sensorData.temperature);
  humidityArray.push(sensorData.humidity);
  pressureArray.push(sensorData.pressure);
  timestampArray.push(timestamp);
  
  // Keep only last 24 entries in each array
  if (temperatureArray.length > 24) {
    temperatureArray.splice(0, temperatureArray.length - 24);
    humidityArray.splice(0, humidityArray.length - 24);
    pressureArray.splice(0, pressureArray.length - 24);
    timestampArray.splice(0, timestampArray.length - 24);
  }
  
  // Store data in Redis for server access
  const dataToStore = {
    temperature: temperatureArray,
    humidity: humidityArray,
    pressure: pressureArray,
    timestamp: timestampArray
  };
  
  await connection.set('read-sensor', JSON.stringify(dataToStore));
  
  console.log(`💾 Dodano dane do pamięci i Redis. Liczba wpisów: ${temperatureArray.length}`);
  console.log('🌡️ Temperatury:', temperatureArray);
  console.log('💧 Wilgotność:', humidityArray);
  console.log('🌪️ Ciśnienie:', pressureArray);
  console.log('⏰ Timestamps:', timestampArray);
  
  return dataToStore;
}, { connection });

worker.on('completed', (job) => {
  console.log(`✅ Zadanie ${job.id} zakończone`);
});
