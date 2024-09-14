const express = require('express');
const { createNewOrder, getAllOrders } = require('../controllers/orderController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(restrictTo('admin'), getAllOrders).post(createNewOrder);

module.exports = router;
