const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

//protected routers should login to do this method
// router.use(authController.protect);
//meddle ware work in place before it not work with them after it will work with them

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSission);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBooking).post(bookingController.createBooking);
router
  .route('/:id')
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateOneBooking)
  .get(bookingController.getOneBooking);
// router.route(`/:id`);

module.exports = router;
