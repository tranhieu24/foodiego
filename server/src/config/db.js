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

    // Auto-seed if no valid products exist
    const VALID_CATEGORIES = ['burger', 'pizza', 'pho', 'sushi', 'salad', 'drink', 'dessert'];
    const validCount = await Product.countDocuments({
      price: { $gt: 0 },
      category: { $in: VALID_CATEGORIES },
      image: { $exists: true, $ne: '' },
    });
    if (validCount < 10) {
      console.log('Insufficient valid products. Starting re-seed...');
      await importData();
    }
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    // Don't exit on Vercel - let the process continue
    // Requests will fail with proper error messages instead
  }
};

export default connectDB;

