const multer = require('multer');
const sharp = require('sharp');
const { put } = require('@vercel/blob');
const Item = require('../models/itemmodel');
const Option = require('../models/optionModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.updateCategories = catchAsync(async () => {
  const categories = await Item.distinct('category');
  const lowerCaseCategories = categories.map((category) => category.toLowerCase());
  const uniqueCategories = [...new Set(lowerCaseCategories)];
  const option = await Option.findOne(); // Assuming there's only one options document

  if (option) {
    const existingCategories = option.category.reduce((acc, cat) => {
      acc[cat.name] = cat.photo;
      return acc;
    }, {});

    const updatedCategories = uniqueCategories.map((name) => ({
      name,
      photo: existingCategories[name] || '', // Retain existing photo or set to empty string
    }));

    option.category = updatedCategories;
    await option.save();
  } else {
    await Option.create({
      category: uniqueCategories.map((name) => ({ name, photo: '' })),
    });
  }
});

/////Alll this function for only update photo category
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadCategoryPhotos = upload.any();

exports.resizeCategoryPhotos = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  // Ensure req.body is an array

  const promises = req.files.map(async (file) => {
    const fileName = `public/img/items/item-${Math.random()}-${Date.now()}.png`;
    const newImage = await sharp(file.buffer)
      .resize(1200, 800)
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
    req.body[file.fieldname] = file.filename;
  });

  await Promise.all(promises);

  next();
});

exports.resizeOffersPhotos = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  // Ensure req.body is an array

  const promises = req.files.map(async (file) => {
    const fileName = `public/img/items/item-${Math.random()}-${Date.now()}.png`;
    const newImage = await sharp(file.buffer)
      .resize(1200, 600)
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
    req.body[file.fieldname] = file.filename;
  });

  await Promise.all(promises);

  next();
});

exports.updateCategoryPhoto = catchAsync(async (req, res, next) => {
  const categories = Object.keys(req.body).reduce((acc, key) => {
    const index = key.match(/\d+/)[0];
    const field = key.replace(/\d+/, '');
    if (!acc[index]) acc[index] = {};
    acc[index][field] = req.body[key];
    return acc;
  }, []);
  const options = await Option.find();
  if (!options || options.length === 0) {
    return next(new AppError('Please try again later.', 400));
  }

  options[0].category = categories;

  await options[0].save();
  res.status(200).json({
    status: 'success',
    option: options[0],
  });
});
