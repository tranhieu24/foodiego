import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { importData, destroyData  } from './utils/seederUtils.js';

dotenv.config();

const run = async () => {
  await connectDB();

  if (process.argv[2] === '-d') {
    await destroyData();
  } else {
    await importData();
  }
  process.exit();
};

run();

