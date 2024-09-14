const express = require('express');
const { createNewOrder } = require('../controllers/orderController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get().post(createNewOrder);

module.exports = router;
