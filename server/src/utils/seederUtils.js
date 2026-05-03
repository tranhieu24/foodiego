const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const users = require('../data/users');
const products = require('../data/products');

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

module.exports = {
  importData,
  destroyData,
};
