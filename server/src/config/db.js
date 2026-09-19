import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { env } from './env.js';

let audioBucket = null;

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] MongoDB connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    console.error('[db] Data endpoints stay unavailable until the database is reachable.');
    console.error('[db] Local: install/start MongoDB, or set MONGODB_URI to an Atlas M0 connection string.');
    return false;
  }
}

export function getAudioBucket() {
  if (!audioBucket) {
    if (!mongoose.connection.db) throw new Error('MongoDB is not connected yet');
    audioBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'audio' });
  }
  return audioBucket;
}

export function dbConnected() {
  return mongoose.connection.readyState === 1;
}

export default connectDB;
