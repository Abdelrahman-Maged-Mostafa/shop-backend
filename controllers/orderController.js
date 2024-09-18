const Item = require('../models/itemmodel');
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

// exports.updateOrder = catchAsync(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);
//   if (!order) return next(new AppError('No order with this id', 404));
//   const status = order.status === 'underReview' ? 'completedPayment' : 'completedOrder';
//   if (status === 'completedPayment') {
//     //i want descrease my stock here
//   }
//   const newOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
//   if (!newOrder) return next(new AppError('Something went wrong. Please try again ', 404));

//   await res.status(201).json({
//     status: 'success',
//     data: { newOrder },
//   });
// });
exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('No order with this id', 404));

  const status = order.status === 'underReview' ? 'completedPayment' : 'completedOrder';

  if (status === 'completedPayment') {
    // Decrease stock for each item in the order
    await Promise.all(
      order.items.map(async (item) => {
        const product = await Item.findById(item.itemId);
        if (product) {
          if (product.properties.colorsAndSize) {
            product.properties.colorsAndSize.forEach((color) => {
              if (color.name === item.color) {
                color.sizes.forEach((size) => {
                  if (size.name === item.size) {
                    size.stock -= item.quantity;
                  }
                });
              }
            });
          } else if (product.properties.sizes) {
            product.properties.sizes.forEach((size) => {
              if (size.name === item.size) {
                size.stock -= item.quantity;
              }
            });
          } else if (product.properties.colors) {
            product.properties.colors.forEach((color) => {
              if (color.name === item.color) {
                color.stock -= item.quantity;
              }
            });
          } else {
            product.stock -= item.quantity;
          }
          await product.save();
        }
      }),
    );
  }

  const newOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!newOrder) return next(new AppError('Something went wrong. Please try again', 404));

  res.status(201).json({
    status: 'success',
    data: { newOrder },
  });
});
