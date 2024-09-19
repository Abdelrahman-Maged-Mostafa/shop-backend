const express = require('express');
const {
  getAllOptions,
  uploadPaymentPhoto,
  resizePaymentPhoto,
} = require('../controllers/optionController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllOptions)
  .patch(protect, restrictTo('admin'), uploadPaymentPhoto, resizePaymentPhoto);

module.exports = router;
