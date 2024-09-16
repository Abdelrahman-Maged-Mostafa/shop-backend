const multer = require('multer');
const sharp = require('sharp');
const { put } = require('@vercel/blob');
const Item = require('../models/itemmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { updateOne, createOne } = require('./handlerFactory');
const User = require('../models/userModel');
///middel ware

//////////////handle images upload
const multerStorage = multer.memoryStorage();
/////
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
///////
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
//////
const uploadItemImages = upload.fields([
  { name: 'imagesType0' },
  { name: 'imagesType1' },
  { name: 'imagesType2' },
]);
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!Object.keys(req.files).length) return next();
  req.body.images = req.body.images ? [...req.body.images] : [];
  async function resizingPhotos(fieldName, i) {
    //remove black px

    //remove black px
    const fileName = `public/img/items/item-${req.params.id}-${Date.now()}-0.jpeg`;
    const newImage = await sharp(req.files[fieldName][0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .png({ quality: 90 });
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { url } = await put(`${fileName}`, newImage, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      req.files[fieldName][0].filename = url;
    } else {
      await newImage.toFile(`${fileName}`);
      req.files[fieldName][0].filename =
        `${req.protocol}://${req.get('host')}/${fileName.split('/').slice(1).join('/')}`;
    }
    req.body.images[i] = req.files[fieldName][0].filename;
    if (i === 0) req.body.imageCover = req.files[fieldName][0].filename;
  }
  if (req.files.imagesType0) await resizingPhotos('imagesType0', 0);
  if (req.files.imagesType1) await resizingPhotos('imagesType1', 1);
  if (req.files.imagesType2) await resizingPhotos('imagesType2', 2);
  next();
});
// await Promise.all(images);

/////////////////////////////// handle Get method

const getAllItems = catchAsync(async (req, res, next) => {
  //to allow nested router
  const data = await Item.find().populate({ path: 'reviews' });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});
/////////////////////////////// handle Post method
const createNewItem = createOne(Item);
/////////////////////////////// handle PATCH method
const updateItem = updateOne(Item);
///////////////////////////////handle delete method
const deleteItem = catchAsync(async (req, res, next) => {
  //delet item
  const doc = await Item.findByIdAndDelete(req.params.id);
  if (!doc) return next(new AppError('No item found with that ID', 404));
  //for delet this item from all cartItems in users.
  await User.updateMany({}, { $pull: { cartItems: { item: req.params.id } } });
  //res
  await res.status(204).json({
    status: 'success',
    data: null,
  });
});

// const getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const { year } = req.params;
//   const plan = await Item.aggregate([
//     { $unwind: '$startDates' }, //to flat arr
//     {
//       $match: {
//         startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numItems: { $sum: 1 },
//         tours: { $push: '$name' },
//       },
//     },
//     { $addFields: { month: '$_id' } },
//     { $project: { _id: 0 } },
//     { $sort: { numItems: -1 } },
//     // { $limit: 6 },
//   ]);
//   await res.status(200).json({
//     status: 'success',
//     data: { plan },
//   });
// });

module.exports = {
  getAllItems,
  createNewItem,
  updateItem,
  deleteItem,
  uploadItemImages,
  resizeUserPhoto,
};
