import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDB } from '../utils/seed.js';

let mongod = null;

export const connectDB = async () => {
  try {
    console.log('\n===================================================================');
    console.log('⚠️  WARNING: STARTING IN-MEMORY MONGODB SERVER');
    console.log('-------------------------------------------------------------------');
    console.log('  Using mongodb-memory-server for local development.');
    console.log('  CRITICAL: ALL REGISTERED USERS AND DATA WILL BE LOST WHEN THE SERVER RESTARTS.');
    console.log('===================================================================\n');
    
    mongod = await MongoMemoryServer.create();
    const dbUrl = mongod.getUri();
    console.log(`In-memory MongoDB started at: ${dbUrl}`);

    await mongoose.connect(dbUrl);
    console.log('MongoDB connection established successfully.');

    console.log('Seeding in-memory database with default data...');
    await seedDB();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
};
