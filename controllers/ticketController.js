const Ticket = require('../models/ticketModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTickets = catchAsync(async (req, res, next) => {
  const userTickets = await Ticket.find({ user: req.user._id }).populate('user').exec();
  if (!userTickets) next(new AppError('Failed to retrieve tickets', 400));
  res.status(200).json({
    status: 'success',
    data: userTickets,
  });
});

exports.updateTicket = catchAsync(async (req, res, next) => {
  const curTicket = await Ticket.findById(req.params.id);
  if (!curTicket) return next(new AppError('No document found with that ID', 404));

  if (`${req.user._id}` !== `${curTicket.user}` && req.user.role !== 'admin') {
    return next(new AppError('You do not have access to perform this action.', 403));
  }

  const newOne = await Ticket.findByIdAndUpdate(
    req.params.id,
    {
      replay: req.user.role === 'admin' ? 'true' : 'false',
      $push: {
        messages: {
          sendEmail: req.user.role === 'admin' ? 'Admin' : req.user.name,
          message: req.body.message,
          createdAt: new Date(Date.now()),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(201).json({
    status: 'success',
    data: newOne,
  });
});

exports.createTicket = catchAsync(async (req, res, next) => {
  const newTicket = new Ticket({
    user: req.user._id,
    title: req.body.title,
    createdAt: new Date(Date.now()),
    messages: [
      { sendEmail: req.user.name, message: req.body.message, createdAt: new Date(Date.now()) },
    ],
  });
  if (!newTicket) next(new AppError('Failed to create ticket', 400));

  await newTicket.save();

  res.status(201).json({
    status: 'success',
    data: newTicket,
  });
});

exports.getAllUserTickets = catchAsync(async (req, res, next) => {
  const userTickets = await Ticket.find({ user: req.user._id });
  if (!userTickets) next(new AppError('Failed to retrieve tickets', 400));
  res.status(200).json({
    status: 'success',
    data: userTickets,
  });
});
