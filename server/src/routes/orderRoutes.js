import express from 'express';
const router = express.Router();
import { addOrderItems, getMyOrders, updateOrderToPaid, getAllOrders, updateOrderToDelivered } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

router.post('/', protect, addOrderItems);
router.get('/', protect, admin, getAllOrders);
router.get('/user/:id', protect, getMyOrders);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

export default router;
