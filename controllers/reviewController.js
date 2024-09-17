const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  // Find orders with the given userId, itemId, and status "completedOrder"
  const order = await Order.findOne({
    user: req.user._id,
    status: 'completedOrder',
    'items.itemId': req.body.item,
  });

  if (!order)
    return next(new AppError('You has not purchased this item or order is not completed.'));

  // Create the review
  req.body.user = req.user._id;
  req.body.createdAt = new Date();
  const review = new Review(req.body);

  await review.save();

  return res.status(200).json({ status: 'success', review });
});
