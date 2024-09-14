const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');

exports.createNewOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  if (req.body.status) delete req.body.status;
  // const testTour = new Tour({ name: 'The Park Camper', price: 997 });
  const newOne = await Order.create(req.body);
  await res.status(201).json({
    status: 'success',
    data: { data: newOne },
  });
});
