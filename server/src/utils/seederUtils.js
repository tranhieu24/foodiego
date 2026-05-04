import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import users from '../data/users.js';
import products from '../data/products.js';

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    await User.create(users);
    await Product.insertMany(products);

    console.log('Database Seeded Successfully!');
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    throw error;
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
  } catch (error) {
    console.error(`Error with data destruction: ${error.message}`);
    throw error;
  }
};

export default {
  importData,
  destroyData,
};
