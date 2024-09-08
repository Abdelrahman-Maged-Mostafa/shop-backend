const express = require('express');
const {
  getAllItems,
  getOneItem,
  createNewItem,
  updateItem,
  deleteItem,
  uploadItemImages,
  resizeUserPhoto,
} = require('../controllers/itemController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRouter');

// const { createNewReview } = require('../controllers/reviewController');
///server router
const router = express.Router();
// router.param('id', checkId);
//nested route
// if you do it you should open mergeParams to read all params in 2 path and use them
router.use('/:tourId/reviews', reviewRouter);
// router
//   .route(`/:tourId/reviews`)
//   .post(authController.protect, authController.restrictTo('user'), createNewReview);

//normal route
// router
//   .route('/monthly-plan/:year')
//   .get(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide', 'guide'),
//     getMonthlyPlan,
//   );

router
  .route('/')
  .get(getAllItems)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    uploadItemImages,
    resizeUserPhoto,
    createNewItem,
  );
router
  .route(`/:id`)
  .get(getOneItem)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadItemImages,
    resizeUserPhoto,
    updateItem,
  )
  .delete(authController.protect, authController.restrictTo('admin'), deleteItem);

module.exports = router;
