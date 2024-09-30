const express = require('express');

const authController = require('../controllers/authController');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

//protected routers should login to do this method
router.use(authController.protect);
//meddle ware work in place before it not work with them after it will work with them

router
  .route('/')
  .get(authController.restrictTo('admin'), ticketController.getAllTickets)
  .post(ticketController.createTicket);

router.route('/user').get(ticketController.getAllUserTickets);

router.route(`/:id`).patch(ticketController.updateTicket);

module.exports = router;
