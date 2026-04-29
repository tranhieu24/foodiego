const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, updateOrderToPaid } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addOrderItems);
router.get('/user/:id', protect, getMyOrders);
router.put('/:id/pay', protect, updateOrderToPaid);

module.exports = router;
