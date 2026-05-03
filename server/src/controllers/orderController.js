import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { calculateDistance, calculateShippingFee  } from '../utils/haversine.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, isPaid, paidAt } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate items price on server to ensure accuracy
  let itemsPrice = 0;
  const itemsWithActualPrice = [];

  for (const item of orderItems) {
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      res.status(400);
      throw new Error(`Invalid product ID: ${item.product}`);
    }

    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    
    itemsPrice += product.price * item.qty;
    itemsWithActualPrice.push({
      name: product.name,
      qty: item.qty,
      image: product.image,
      price: product.price, // Use actual price from DB
      product: product._id,
    });
  }

  // Calculate shipping fee
  let shippingFee = 0;
  if (shippingAddress.lat && shippingAddress.lng) {
    const storeLat = 10.762622;
    const storeLng = 106.660172;
    const distance = calculateDistance(storeLat, storeLng, shippingAddress.lat, shippingAddress.lng);
    shippingFee = calculateShippingFee(distance);
  } else {
    // Default fallback if no coordinates provided
    shippingFee = 15000;
  }

  const totalPrice = itemsPrice + shippingFee;

  const order = new Order({
    orderItems: itemsWithActualPrice,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingFee,
    totalPrice,
    isPaid: isPaid || false,
    paidAt: isPaid ? (paidAt || Date.now()) : null,
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/user/:id
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  // Ensure user can only see their own orders unless they are admin
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view these orders');
  }

  const orders = await Order.find({ user: req.params.id });
  res.json(orders);
});

// @desc    Update order to paid (Simulated Webhook)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export default {;
  addOrderItems,
  getMyOrders,
  updateOrderToPaid,
};
