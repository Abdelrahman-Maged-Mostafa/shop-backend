const multer = require('multer');
const sharp = require('sharp');
const Item = require('../models/itemmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');
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
const uploadItemImages = upload.fields(
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
);
upload.array('image', 5);
///////
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  if (!req.files.images) return next();

  //cover image
  req.body.images = [];
  const images = req.files.images.map(async (file, i) => {
    const fileName = `public/img/items/item-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${fileName}`);
    req.body.images.push(fileName);
  });
  await Promise.all(images);
  next();
});

/////////////////////////////// handle Get method

const getAllItems = getAll(Item);
/////////////////////////////// handle Get method by id
const getOneItem = getOne(Item, { path: 'reviews' });
/////////////////////////////// handle Post method
const createNewItem = createOne(Item);
/////////////////////////////// handle PATCH method
const updateItem = updateOne(Item);
///////////////////////////////handle delete method
const deleteItem = deleteOne(Item);

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
  getOneItem,
  createNewItem,
  updateItem,
  deleteItem,
  uploadItemImages,
  resizeUserPhoto,
};
