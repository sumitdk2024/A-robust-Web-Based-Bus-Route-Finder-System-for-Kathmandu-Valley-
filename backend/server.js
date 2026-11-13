import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dataRoutes from './routes/dataRoutes.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { walkingRoute } from './controllers/walkingRouteController.js';
import { geocode } from './controllers/geocodingController.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });

export const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Kathmandu Bus Route Finder API is running' });
});

app.post('/api/walking-route', walkingRoute);
app.post('/api/geocode', geocode);
app.use('/api', dataRoutes);
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found' }));
app.use((error, req, res, next) => {
  const status = error.status === 400 ? 400 : 500;
  console.error(`Request failed (${error.name || 'Error'}).`);
  res.status(status).json({ message: status === 400 ? 'Invalid request body' : 'Unable to retrieve data. Please try again later.' });
});

async function startServer() {
  try {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be an integer between 1 and 65535.');
    }

    // CSV-backed API: no legacy database is read.

    const server = app.listen(port, () => {
      console.log(`Kathmandu Bus Route Finder API is running at http://localhost:${port}`);
    });

    server.on('error', async (error) => {
      console.error(`HTTP server could not start (${error.code || 'unknown error'}). Check whether PORT is already in use.`);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => {
        server.close(async () => {
          await mongoose.disconnect();
          console.log('Server stopped; MongoDB connection closed.');
        });
      });
    }
  } catch (error) {
    console.error(error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer();
