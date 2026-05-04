import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { importData } from '../utils/seederUtils.js';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if database is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database is empty. Starting auto-seed...');
      await importData();
    }
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    // Don't exit on Vercel - let the process continue
    // Requests will fail with proper error messages instead
  }
};

export default connectDB;

