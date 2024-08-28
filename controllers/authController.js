const { promisify } = require('util');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const loginUser = (statusCode, curUser, req, res) => {
  // console.log('finesh send2');
  const token = signToken(curUser._id);
  // console.log('finesh send3');
  //send cookie to client to run again in every time use my server
  // res.cookie('nameofFile you will send',and your data you need to send,options for cookie);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true,
  };
  // console.log('finesh send4');
  // in prod only do this cookies
  // if (process.env.NODE_ENV === 'production') res.cookie('jwt', token, cookieOptions);
  if (req.secure || req.headers(`x-forwarded-proto`) === 'https')
    res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  // console.log('finesh send');

  loginUser(201, newUser, req, res);
});
// login method
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please enter your email and password', 400));
  }
  const curUser = await User.findOne({ email }).select('+password');

  if (!curUser || !(await curUser.correctPassword(password, curUser.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  loginUser(200, curUser, req, res);
});

// logout method
exports.logout = (req, res) => {
  res.cookie(`jwt`, 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ status: 'success' });
};
// protect my routes to only some user get access
exports.protect = catchAsync(async (req, res, next) => {
  // console.log(req.body, '55555555555555555555555555555555555555555555');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //Check if user login or not
  if (!token) {
    return next(new AppError('You are not logged in please login to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //we handel 2 error in appError expaired token and not valid token
  const freshUser = await User.findById(decoded.id);

  //Check if user still have account or deleted it
  if (!freshUser) {
    return next(new AppError('The token belonging to this user does no longer exist.', 401));
  }

  //Check if user changed password after login or not
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! please login again', 401));
  }

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

//logged in
//only for render pages and no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //Check if user login or not
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      //we handel 2 error in appError expaired token and not valid token
      const freshUser = await User.findById(decoded.id);
      //Check if user still have account or deleted it
      if (!freshUser) {
        return next();
      }
      //Check if user changed password after login or not
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      next();
    } else {
      next();
    }
  } catch (err) {
    next();
  }
};

// some features need admin only to use
exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to perform this action ", 403));
    }
    next();
  });
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)user Poseted email and we send random token to this email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forget your password ? Submit a patch request with your new password and passwordConfirm to:${resetURL} .\n If you didn't forget your password, please ignore this email! `;
  try {
    // await sendEmail({
    //   email: req.body.email,
    //   subject: 'Forget Password you can use this message in only 10 min',
    //   text: message,
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      // message: 'Token send to your email!',
      message: 'Your reset password link send to your email address please check it!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  /* user send this token and send new password and we will
  changed his email's password to new password */
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //login
  loginUser(200, user, req, res);
});
//change password normally
exports.updatePassword = catchAsync(async (req, res, next) => {
  //first protect this route
  //be sure this user have password
  const user = await User.findById(req.user.id).select('+password');
  if (!(await req.user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('Wrong old password', 400));
  }
  //update Password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //login
  loginUser(200, user, req, res);
});
