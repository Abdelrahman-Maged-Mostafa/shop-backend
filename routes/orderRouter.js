const express = require('express');
const {
  createNewOrder,
  getAllOrders,
  getOrder,
  getAllUserOrders,
  getUserOrder,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(restrictTo('admin'), getAllOrders).post(createNewOrder);
router.route('/userOrder').get(getAllUserOrders);
router.route('/userOrder/:id').get(getUserOrder);
router.route('/:id').get(restrictTo('admin'), getOrder);

module.exports = router;
