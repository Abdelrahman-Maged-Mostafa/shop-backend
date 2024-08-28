const AppError = require('../utils/appError');

const sendErrDev = (err, res) => {
  if (res.req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('error', { title: 'Something went wrong!' });
  }
};

const sendErrProd = (err, res) => {
  // this if to only proggrammer see the error not normal client
  if (res.req.originalUrl.startsWith('/api')) {
    if (!err.isOperational) {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong ',
      });
    } else {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'not found message',
      });
    }
  } else {
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong!', msg: err.message || 'not found message' });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handlecodeErrorDB = (err) => {
  //   const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};
const handleJWTErrorDB = () => new AppError('Invalid token please login again', 401);

const handleJWTExpiredErrorDB = () =>
  new AppError('Your token has expired! please login again', 401);

const handlValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((elem) => {
    return {
      value: elem.properties.value,
      path: elem.properties.path,
      message: elem.properties.message,
    };
  });
  const message = {
    type: `Invalid input data.`,
    path: errors.map((elem) => elem.path).join(' , '),
    message: errors.map((elem) => elem.message).join(' , '),
  };
  return new AppError(message, 400);
  //   return new AppError(message, 400);
};

exports.middlewareError = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // console.log('development');
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log('production');
    let error = { ...err };
    // console.log('poda');
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handlecodeErrorDB(error);
    if (error._message === 'Tour validation failed') error = handlValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTErrorDB();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredErrorDB();
    console.log(error);
    sendErrProd(error, res);
  }
};
