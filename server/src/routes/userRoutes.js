import express from 'express';
const router = express.Router();
import { getUserAddresses, addAddress, updateAddress, calculateShipping, getAllUsers } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

router.get('/all', protect, admin, getAllUsers);

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress);
router.route('/calculate-shipping')
  .post(protect, calculateShipping);

export default router;
