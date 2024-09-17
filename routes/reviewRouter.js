const express = require('express');
const {
  getReview,
  getAllReviews,
  deleteReview,
  updateReview,
  createReview,
} = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

//protected routers should login to do this method
router.use(authController.protect);
//meddle ware work in place before it not work with them after it will work with them

router.route('/').get(getAllReviews).post(authController.restrictTo('user'), createReview);

router
  .route(`/:id`)
  .get(getReview)
  .delete(deleteReview)
  .patch(authController.restrictTo('user', 'admin'), updateReview);

module.exports = router;
