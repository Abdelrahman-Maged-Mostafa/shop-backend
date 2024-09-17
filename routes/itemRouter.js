const express = require('express');
const {
  getAllItems,
  createNewItem,
  updateItem,
  deleteItem,
  uploadItemImages,
  resizeUserPhoto,
} = require('../controllers/itemController');
const authController = require('../controllers/authController');

const router = express.Router();

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
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    uploadItemImages,
    resizeUserPhoto,
    updateItem,
  )
  .delete(authController.protect, authController.restrictTo('admin'), deleteItem);

module.exports = router;
