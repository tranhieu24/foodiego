import express from 'express';
const router = express.Router();
import { addOrderItems, getMyOrders, updateOrderToPaid  } from '../controllers/orderController.js';
import { protect  } from '../middleware/auth.js';

router.post('/', protect, addOrderItems);
router.get('/user/:id', protect, getMyOrders);
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;;
