const express = require('express');
const {
  createNewOrder,
  getAllOrders,
  getAllUserOrders,
  deleteOrder,
  updateOrder,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(restrictTo('admin'), getAllOrders).post(createNewOrder);
router.route('/userOrder').get(getAllUserOrders);
router
  .route('/:id')
  .delete(restrictTo('admin'), deleteOrder)
  .patch(restrictTo('admin'), updateOrder);

module.exports = router;
