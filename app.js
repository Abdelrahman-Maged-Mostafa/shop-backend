const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const itemRouter = require('./routes/itemRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const { middlewareError } = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouters');
const orderRouter = require('./routes/orderRouter');
const optionRouter = require('./routes/optionRouter');
const ticketRouter = require('./routes/ticketRouter');
const { deleteData, importData } = require('./dev-data/data/import-Dev-Data');

const app = express();
/////
app.enable('trust proxy');
//Render some template and see this in your wep
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1)Global Middleware
///this helmet for more than 15 middle ware functions
app.use(helmet());
//this will make app work with post and get
app.use(cors());
//this will open all methods
app.options(`*`, cors());
//to know some info about your requestes in development
if (process.env.NODE_ENV === 'development') app.use(morgan(`dev`));

//limit request from same IP
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter);

//Bodyparser, reading data from body into req.body
app.use(express.json({ limit: '10000kb' }));
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Prevent parameters pullution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

app.use(compression());
//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, `public`)));

///try playing with middleware

//other try test middle ware function
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// handle method in server

// app.get(toursURL, getAllTours);
// app.get(`${toursURL}/:id`, getOneTour);
// app.patch(`${toursURL}/:id`, updateTour);
// app.post(`${toursURL}`, createNewTour);
// app.delete(`${toursURL}/:id`, deleteTour);
//for read all img in vps server to your front end
app.use('/img/items', express.static(path.join(__dirname, 'public', 'img', 'items')));
//render some html in pug
const viewURL = '/';
app.use(viewURL, viewRouter);

const toursURL = '/api/v1/items';
app.use(toursURL, itemRouter);

const usersURL = '/api/v1/users';
app.use(usersURL, userRouter);

const reviewURL = '/api/v1/reviews';
app.use(reviewURL, reviewRouter);

const orderURL = '/api/v1/orders';
app.use(orderURL, orderRouter);

app.use((req, res, next) => {
  if (req.body && req.body.ANALYTICSGOOGLE) {
    req.body.ANALYTICSGOOGLE = req.body.ANALYTICSGOOGLE.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  next();
});
const optionURL = '/api/v1/option';
app.use(optionURL, optionRouter);

const ticketURL = '/api/v1/tickets';
app.use(ticketURL, ticketRouter);
//for error
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(middlewareError);
//Function Set data
const refreshData = async () => {
  await deleteData();
  await importData();
};
setInterval(refreshData, 3 * 60 * 1000); // 3 minutes in milliseconds

module.exports = app;
