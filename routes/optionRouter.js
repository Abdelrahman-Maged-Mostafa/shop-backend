const express = require('express');
const {
  getAllOptions,
  uploadPaymentPhotos,
  resizePaymentPhotos,
  updatePaymentMethod,
  updateCashOnDelivery,
  updateDefaultColors,
  updateChangeColors,
  uploadLogoPhotos,
  resizeLogoPhoto,
  updateChangeLogo,
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
router.route('/defaultColors').patch(protect, restrictTo('admin'), updateDefaultColors);
router.route('/changeColors').patch(protect, restrictTo('admin'), updateChangeColors);
router
  .route('/changeLogo')
  .patch(protect, restrictTo('admin'), uploadLogoPhotos, resizeLogoPhoto, updateChangeLogo);

module.exports = router;
