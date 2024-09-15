const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createNewOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  if (req.body.status) delete req.body.status;
  const newOne = await Order.create(req.body);
  await res.status(201).json({
    status: 'success',
    data: { data: newOne },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  //   const orders = await Order.find({ user: req.user.id }).populate('user').exec();
  const orders = await Order.find().populate('user').exec();
  await res.status(201).json({
    status: 'success',
    data: { data: orders },
  });
});

exports.getAllUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).populate('user').exec();
  await res.status(201).json({
    status: 'success',
    data: { data: orders },
  });
});

exports.getUserOrder = catchAsync(async (req, res, next) => {
  //   const orders = await Order.find({ user: req.user.id }).populate('user').exec();
  const order = await Order.findById(req.params.id)
    .populate('user') // Populate the user reference
    .populate('items.item') // Populate the item reference within items
    .exec();
  if (order.user._id !== req.user.id) return new AppError('This is not your order', 403);
  await res.status(201).json({
    status: 'success',
    data: { data: order },
  });
});
exports.getOrder = catchAsync(async (req, res, next) => {
  //   const orders = await Order.find({ user: req.user.id }).populate('user').exec();
  const order = await Order.findById(req.params.id)
    .populate('user') // Populate the user reference
    .populate('items.item') // Populate the item reference within items
    .exec();

  await res.status(201).json({
    status: 'success',
    data: { data: order },
  });
});
