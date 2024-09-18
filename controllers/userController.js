// const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { updateOne, getOne, getAll } = require('./handlerFactory');

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  const body = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };
  const updatedUser = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return next(new AppError('Some Error Founded! Please try again.', 404));

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

const getAllusers = getAll(User);
const getOneuser = getOne(User);
const updateuser = updateOne(User);

const addToCart = catchAsync(async (req, res, next) => {
  const cartItems = [...req.user.cartItems, req.body];
  const cartItemsUnique = cartItems.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.item.toString() === item.item.toString() &&
          t.properties.color === item.properties.color &&
          t.properties.size === item.properties.size,
      ),
  );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { cartItems: cartItemsUnique },
    { new: true },
  );

  if (!user) {
    return next(new AppError('Update failed', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

const removeFromCart = catchAsync(async (req, res, next) => {
  const user = await User.updateOne(
    { _id: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
  );

  if (!user) {
    return next(new AppError('Update faild', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

const removeAllCart = catchAsync(async (req, res, next) => {
  const user = await User.updateOne({ _id: req.user._id }, { cartItems: [] });

  if (!user) {
    return next(new AppError('Update faild', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  removeAllCart,
  removeFromCart,
  addToCart,
  getAllusers,
  getOneuser,
  updateuser,
  updateMe,
  getMe,
};
