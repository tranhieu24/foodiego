const express = require('express');
const router = express.Router();
const { getUserAddresses, addAddress, updateAddress, calculateShipping } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress);
router.route('/calculate-shipping')
  .post(protect, calculateShipping);

module.exports = router;
