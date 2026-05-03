const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { importData, destroyData } = require('./utils/seederUtils');

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

