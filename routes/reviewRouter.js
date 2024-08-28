const express = require('express');
const {
  getReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourAndUserId,
  createReview,
} = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

//protected routers should login to do this method
router.use(authController.protect);
//meddle ware work in place before it not work with them after it will work with them

router
  .route('/')
  .get(getAllReviews)
  .post(authController.restrictTo('user'), setTourAndUserId, createReview);

router
  .route(`/:id`)
  .get(getReview)
  .delete(authController.restrictTo('user', 'admin'), deleteReview)
  .patch(authController.restrictTo('user', 'admin'), updateReview);

module.exports = router;
