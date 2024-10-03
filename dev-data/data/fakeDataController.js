const Item = require('../../models/itemmodel');
const Review = require('../../models/reviewModel');
const Option = require('../../models/optionModel');
const { optionsData } = require('./option');
const catchAsync = require('../../utils/catchAsync');
const { itemsData } = require('./items');
const { reviewsData } = require('./review');

exports.updateOption = catchAsync(async (req, res, next) => {
  await Option.deleteMany();

  await Option.create(optionsData);

  await Option.deleteMany({ _id: { $ne: optionsData[0]._id } });

  res.status(200).json({
    status: 'success',
    option: optionsData[0],
  });
});

exports.updateItems = catchAsync(async (req, res, next) => {
  await Item.deleteMany();

  await Item.create(itemsData);

  res.status(200).json({
    status: 'success',
    items: itemsData,
  });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
  await Review.deleteMany();

  await Review.create(reviewsData);

  res.status(200).json({
    status: 'success',
    option: optionsData[0],
  });
});
