const express = require('express');
const {
  uploadUserPhoto,
  resizeUserPhoto,
  getAllusers,
  createNewuser,
  getOneuser,
  updateuser,
  deleteuser,
  updateMe,
  deleteMe,
  getMe,
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
router.get('/me', getMe, getOneuser);
router.delete('/deleteMe', deleteMe);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.patch('/updateMyPassword', updatePassword);

//should be only admin do this method only createNewuser will be free
router.use(restrictTo('admin'));
//meddle ware work in place before it not work with them after it will work with them
router.route('/').get(getAllusers).post(createNewuser);
router.route(`/:id`).get(getOneuser).patch(updateuser).delete(deleteuser);

module.exports = router;
