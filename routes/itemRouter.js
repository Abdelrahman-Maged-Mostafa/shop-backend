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
    authController.restrictTo('admin', 'managerItems'),
    uploadItemImages,
    resizeUserPhoto,
    createNewItem,
  );
router
  .route(`/:id`)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'managerItems'),
    uploadItemImages,
    resizeUserPhoto,
    updateItem,
  )
  .delete(authController.protect, authController.restrictTo('admin', 'managerItems'), deleteItem);

module.exports = router;
