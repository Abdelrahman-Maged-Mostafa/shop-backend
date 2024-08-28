const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handelFactor = require('./handlerFactory');

exports.getCheckoutSission = catchAsync(async (req, res, next) => {
  const curTour = await Tour.findById(req.params.tourId);

  if (!curTour) return next(new AppError('No Tour founded', 404));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${curTour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${curTour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: curTour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${curTour.name} Tour`,
            description: curTour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${curTour.imageCover}`],
          },
        },
        // price: curTour.price * 100,
      },
    ],
  });
  //3) Create Sission
  res.status(200).json({
    status: 'success',
    session,
  });
});

////// This for fun becouse all can go to this url with no payment
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  //   console.log(tour, user, price);
  if (!tour || !user || !price) return next();
  const book = await Booking.create({ tour, user, price: +price });
  if (!book) return next(new AppError('', 400));

  // this for clear url from all query to know one know :)
  res.redirect(req.originalUrl.split('?')[0]);
  //   return res.status(200).json({
  //     status: 'success',
  //     data: book,
  //   });

  // this if you go to hem to dashboard becouse the url in success pay is only /
});
////////////////////////
/////////////////////////////////
/////////////////////////////////////
// Creat CRUD method
exports.getAllBooking = handelFactor.getAll(Booking);
exports.createBooking = handelFactor.createOne(Booking);
exports.deleteBooking = handelFactor.deleteOne(Booking);
exports.getOneBooking = handelFactor.getOne(Booking);
exports.updateOneBooking = handelFactor.updateOne(Booking);
