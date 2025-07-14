
// server.ts
import express from 'express';
import IORedis from 'ioredis';

const app = express();
const port = 3002;

const redis = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

app.get('/data', async (req, res) => {
  try {
    const json = await redis.get('read-sensor');
    if (!json) return res.status(404).send({ error: 'Brak danych' });

    res.json(JSON.parse(json));
  } catch (error) {
    console.error('Błąd podczas pobierania danych:', error);
    res.status(500).send({ error: 'Błąd serwera' });
  }
});

app.listen(port, () => {
  console.log(`API działa na http://localhost:${port}`);
});