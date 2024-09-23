const multer = require('multer');
const sharp = require('sharp');
const { put } = require('@vercel/blob');
const Option = require('../models/optionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { defaultOption } = require('./defaultOption');

/////Alll this function for only update payment
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPaymentPhotos = upload.any();
exports.uploadLogoPhotos = upload.single('photo');

exports.resizePaymentPhotos = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  // Ensure req.body is an array
  const bodyArray = Array.isArray(req.body) ? req.body : Object.values(req.body);

  const promises = req.files.map(async (file) => {
    const fileName = `public/img/items/item-${Math.random()}-${Date.now()}.png`;
    const newImage = await sharp(file.buffer)
      .resize(1000, 500)
      .toFormat('png')
      .png({ quality: 90 });

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { url } = await put(`${fileName}`, newImage, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      file.filename = url;
    } else {
      await newImage.toFile(`${fileName}`);
      file.filename = `${req.protocol}://${req.get('host')}/${fileName.split('/').slice(1).join('/')}`;
    }
    bodyArray[+file.fieldname.slice(0, 1)].photo = file.filename;
  });

  await Promise.all(promises);

  req.body = bodyArray; // Update req.body with the modified array
  next();
});

/////end
/////
exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  // Update the paymentMethod of the first option in the array
  options[0].paymentMethod = Object.values(req.body);

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});

exports.updateCashOnDelivery = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  // Update the paymentMethod of the first option in the array
  options[0].cashOnDelivery = !options[0].cashOnDelivery;

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});

exports.updateDefaultColors = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  // Update the paymentMethod of the first option in the array
  options[0].colors = defaultOption.colors;

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});

exports.updateChangeColors = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  // Update the paymentMethod of the first option in the array
  options[0].colors = req.body;

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});

exports.resizeLogoPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const fileName = `public/img/items/logo-${Math.random()}-${Date.now()}.png`;
  const newImage = await sharp(req.file.buffer)
    .resize(1000, 500)
    .toFormat('png')
    .png({ quality: 90 });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(`${fileName}`, newImage, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    req.file.filename = url;
  } else {
    await newImage.toFile(`${fileName}`);
    req.file.filename = `${req.protocol}://${req.get('host')}/${fileName.split('/').slice(1).join('/')}`;
  }

  req.body.photo = req.file.filename;
  next();
});

exports.updateChangeLogo = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }
  // Update the paymentMethod of the first option in the array
  options[0].logo = req.body.photo;

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});

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

exports.updateOffersPhoto = catchAsync(async (req, res, next) => {
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  options[0].offers = Object.values(req.body);

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});
