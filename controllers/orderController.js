const Order = require('../models/orderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createNewOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  req.body.createdAt = new Date();
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
  if (!orders) return next(new AppError('No orders found with that ID', 404));
  await res.status(201).json({
    status: 'success',
    data: { data: orders },
  });
});

exports.getAllUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).populate('user').exec();
  if (!orders) return next(new AppError('No orders found with that ID', 404));
  await res.status(201).json({
    status: 'success',
    data: { data: orders },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  await Order.findByIdAndDelete(req.params.id);

  await res.status(201).json({
    status: 'success',
    data: null,
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('No order with this id', 404));
  const status = order.status === 'underReview' ? 'completedPayment' : 'completedOrder';
  const newOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!newOrder) return next(new AppError('Something went wrong. Please try again ', 404));

  await res.status(201).json({
    status: 'success',
    data: { newOrder },
  });
});
