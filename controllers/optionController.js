const Option = require('../models/optionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { defaultOption } = require('./defaultOption');

exports.getAllOptions = catchAsync(async (req, res, next) => {
  let data = await Option.find();
  if (data.length === 0) {
    data = await Option.create(defaultOption);
  }
  if (!data) return next(new AppError('Please try again later.', 400));
  res.status(200).json({
    status: 'success',
    data,
  });
});
