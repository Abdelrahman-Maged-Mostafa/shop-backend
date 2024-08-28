///2)Route Handler
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
// const checkId = (req, res, next, val) => {
//   if (!tours.find((tour) => tour.id === +val))
//     return res.status(404).json({ status: 'fail', message: 'invalid id' });
//   next();
// };
// const checkBody = (req, res, next) => {
//   // console.log('welcome', req.body);
//   if (!req?.body?.name || !req?.body?.price)
//     return res.status(404).json({ status: 'fail', message: 'Bad request' });
//   next();
// };
// const toursInfo = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours.json`)
// );
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');
///middel ware
const aliasTopTour = function (req, res, next) {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'ratingAverage,price,name,difficulty,summary';
  next();
};
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
const uploadTourImages = upload.fields(
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
);
upload.array('image', 5);
///////
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  if (!req.files.imageCover || !req.files.images) return next();

  //cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.file.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  ///2)images
  req.body.images = [];
  const images = req.files.images.map(async (file, i) => {
    const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${fileName}`);
    req.body.images.push(fileName);
  });
  await Promise.all(images);
  next();
});

/////////////////////////////// handle Get method

const getAllTours = getAll(Tour);
/////////////////////////////// handle Get method by id
const getOneTour = getOne(Tour, { path: 'reviews' });
/////////////////////////////// handle Post method
const createNewTour = createOne(Tour);
/////////////////////////////// handle PATCH method
const updateTour = updateOne(Tour);
///////////////////////////////handle delete method
const deleteTour = deleteOne(Tour);
// const deleteTour = catchAsync(async (req, res, next) => {
//   const deletedTour = await Tour.findByIdAndDelete(req.params.id);
//   if (!deletedTour) return next(new AppError('No tour found with that ID', 404));

//   await res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } }, //to filter
    {
      $group: {
        //to make your methode
        _id: { $toUpper: '$difficulty' },
        // _id: '$difficulty',
        numItems: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: 'EASY' } } },
  ]);
  await res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, //to flat arr
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numItems: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numItems: -1 } },
    // { $limit: 6 },
  ]);
  await res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

//this function make Filter by geoLocation and this will have more magic becouse that see all method early  and be carefull with this method and you can see all of this methode in documentation
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // mi mean maeil other that will be kilo meters and you shoud divided the distance by Earth r to get your distance by radiuns to give them to mongoDB :)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.0006214 : 0.001;

  if (!lat || !lng)
    return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { distances },
  });
});

module.exports = {
  getAllTours,
  getOneTour,
  createNewTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeUserPhoto,
};
