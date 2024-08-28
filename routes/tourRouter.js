const express = require('express');
const {
  getAllTours,
  getOneTour,
  createNewTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeUserPhoto,
} = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');
// const { createNewReview } = require('../controllers/reviewController');
///server router
const router = express.Router();
// router.param('id', checkId);
//nested route
// i f you do it you should open mergeParams to read all params in 2 path and use them
router.use('/:tourId/reviews', reviewRouter);
// router
//   .route(`/:tourId/reviews`)
//   .post(authController.protect, authController.restrictTo('user'), createNewReview);

//normal route
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan,
  );
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
//127.0.0.1:8000/api/v1/tours/tours-within/300/center/40,-45/unit/mi

router.route('/distance/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), createNewTour);
router
  .route(`/:id`)
  .get(getOneTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeUserPhoto,
    updateTour,
  )
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
