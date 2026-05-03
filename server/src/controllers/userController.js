import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { calculateDistance, calculateShippingFee  } from '../utils/haversine.js';

// @desc    Get user addresses
// @route   GET /api/user/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add a new address
// @route   POST /api/user/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { label, addressDetail, coordinates, isDefault } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    const newAddress = {
      label,
      addressDetail,
      coordinates,
      isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update or set default address
// @route   PUT /api/user/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { label, addressDetail, coordinates, isDefault } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    const address = user.addresses.id(req.params.id);

    if (address) {
      if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;
      }

      address.label = label || address.label;
      address.addressDetail = addressDetail || address.addressDetail;
      if (coordinates) address.coordinates = coordinates;

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  }
});

// @desc    Calculate shipping fee
// @route   POST /api/user/calculate-shipping
// @access  Private
const calculateShipping = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  
  if (!lat || !lng) {
    res.status(400);
    throw new Error('Please provide coordinates');
  }

  // Example: Store location (Central HCMC)
  const storeLat = 10.762622;
  const storeLng = 106.660172;

  const distance = calculateDistance(storeLat, storeLng, lat, lng);
  const shippingFee = calculateShippingFee(distance);

  res.json({
    distance: distance.toFixed(2),
    shippingFee,
    currency: 'VND'
  });
});

export default {;
  getUserAddresses,
  addAddress,
  updateAddress,
  calculateShipping
};
