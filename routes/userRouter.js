const express = require('express');
const {
  addToCart,
  getAllusers,
  getOneuser,
  updateMe,
  getMe,
  removeFromCart,
  removeAllCart,
  bannedUser,
  unBannedUser,
  addAndRemoveToWishList,
  changeRole,
} = require('../controllers/userController');
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
  valid,
} = require('../controllers/authController');
/// server router
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// router.post('/updateUserData', updateUserData);
router.get('/logout', logout);
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);

//protected routers should login to do this method
router.use(protect);
//meddle ware work in place before it not work with them after it will work with them
router.get('/valid', valid);
router.patch('/addToCart', addToCart);
router.patch('/addAndRemoveToWishList/:id', addAndRemoveToWishList);
router.patch('/removeFromCart/:itemId', removeFromCart);
router.patch('/removeFromCart', removeAllCart);

router.get('/me', getMe, getOneuser);
router.patch('/updateMe', updateMe);
router.patch('/updateMyPassword', updatePassword);

//should be only admin do this method only createNewuser will be free
router.use(restrictTo('admin'));
//meddle ware work in place before it not work with them after it will work with them
router.route('/').get(getAllusers);
router.route(`/ban/:id`).patch(bannedUser);
router.route(`/unBan/:id`).patch(unBannedUser);
router.patch('/rol', changeRole);

module.exports = router;
