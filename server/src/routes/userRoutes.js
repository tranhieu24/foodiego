import express from 'express';
const router = express.Router();
import { getUserAddresses, addAddress, updateAddress, calculateShipping  } from '../controllers/userController.js';
import { protect  } from '../middleware/auth.js';

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress);
router.route('/calculate-shipping')
  .post(protect, calculateShipping);

export default router;;
