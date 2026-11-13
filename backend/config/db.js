import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri === 'your_mongodb_connection_string_here') {
    throw new Error('MONGO_URI is missing. Add it to your backend .env file.');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');
  } catch {
    // Connection errors may contain credentials, so report a safe message.
    throw new Error('MongoDB connection failed. Check MONGO_URI in backend/.env, your database credentials, and the Atlas IP access list (or your local MongoDB service).');
  }
}
