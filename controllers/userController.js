// const jwt = require('jsonwebtoken');
const multer = require('multer');
const { put } = require('@vercel/blob');
const sharp = require('sharp');
const User = require('../models/userModel');
// const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//////Upload photo and resizing
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
/////
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
///////
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
//////
///////
const uploadUserPhoto = upload.single('photo');
///////////////////////
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) return next();

  const filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  const resize = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 });
  // .toFile(`/img/users/${req.file.filename}`);

  const { url } = await put(filename, resize, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  req.file.filename = url;
  next();
});
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// const signToken = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

// const loginUser = (statusCode, curUser, res) => {
//   const token = signToken(curUser._id);

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//   });
// };

///handel users
//update data for personaly user
const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  //create error if user try to update password or other rule
  // const user = await User.findById(req.user.id).select('+password');
  // if (!(await req.user.correctPassword(req.body.password, user.password))) {
  //   return next(new AppError('Wrong old password', 400));
  // }
  //update Password
  // console.log(req.body.newName);
  const body = { name: req.body.newName, email: req.body.newEmail };
  // console.log(req.body);
  if (req.file) body.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return next(new AppError('Some Error Founded! Please try again.', 404));

  //login
  // loginUser(200, user, res);
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});
///////
const deleteMe = catchAsync(async (req, res, next) => {
  //create error if user try to update password or other rule
  const user = await User.findById(req.user.id).select('+password');
  if (!(await req.user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Wrong old password', 400));
  }
  //update Password
  await User.findByIdAndUpdate(user._id, { active: false, passwordChangedAt: Date.now() });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// other methods admin
const createNewuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined',
  });
};

const getAllusers = getAll(User);
const getOneuser = getOne(User);
//can't update password with this
const updateuser = updateOne(User);

//this not make user inactive only nooooooo this will delete user from database
const deleteuser = deleteOne(User);

module.exports = {
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
};
