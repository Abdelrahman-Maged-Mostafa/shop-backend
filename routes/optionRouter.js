const express = require('express');
const {
  getAllOptions,
  uploadPaymentPhotos,
  resizePaymentPhotos,
  updatePaymentMethod,
  updateCashOnDelivery,
} = require('../controllers/optionController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllOptions)
  .patch(
    protect,
    restrictTo('admin'),
    uploadPaymentPhotos,
    resizePaymentPhotos,
    updatePaymentMethod,
  );
router.route('/cash').patch(protect, restrictTo('admin'), updateCashOnDelivery);

module.exports = router;
