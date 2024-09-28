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
  updateOffersPhoto,
  updateFooterBody,
  updateAboutUsBody,
  updateNumItemsBody,
  updateOffersLine,
  updateSEO,
  UpdateANALYTICSGOOGLE,
} = require('../controllers/optionController');
const { protect, restrictTo } = require('../controllers/authController');
const {
  resizeCategoryPhotos,
  uploadCategoryPhotos,
  updateCategoryPhoto,
  resizeOffersPhotos,
} = require('../controllers/categoryController');

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
router
  .route('/changeCategoryPhoto')
  .patch(
    protect,
    restrictTo('admin'),
    uploadCategoryPhotos,
    resizeCategoryPhotos,
    updateCategoryPhoto,
  );
router
  .route('/changeOffersPhoto')
  .patch(protect, restrictTo('admin'), uploadCategoryPhotos, resizeOffersPhotos, updateOffersPhoto);

router.route('/updateFooterBody').patch(protect, restrictTo('admin'), updateFooterBody);
router.route('/updateAboutUs').patch(protect, restrictTo('admin'), updateAboutUsBody);
router.route('/updateNumItemsBody').patch(protect, restrictTo('admin'), updateNumItemsBody);
router.route('/updateOffersLine').patch(protect, restrictTo('admin'), updateOffersLine);
router.route('/updateSEO').patch(protect, restrictTo('admin'), updateSEO);
router.route('/updateANALYTICSGOOGLE').patch(protect, restrictTo('admin'), UpdateANALYTICSGOOGLE);

module.exports = router;
