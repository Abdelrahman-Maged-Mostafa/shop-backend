const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// this catchAsync should be this return function to work please be carfull
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));

    await res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newOne = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!newOne) return next(new AppError('No document found with that ID', 404));

    await res.status(201).json({
      status: 'success',
      data: newOne,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const testTour = new Tour({ name: 'The Park Camper', price: 997 });
    const newOne = await Model.create(req.body);
    await res.status(201).json({
      status: 'success',
      data: { data: newOne },
    });
  });

exports.getOne = (Model, populate = false) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (populate) doc = await Model.findById(req.params.id).populate({ path: populate.path });
    else doc = await Model.findById(req.params.id);

    // const tour = await Tour.findOne({ _id:req.params.id });
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow nested router
    let filter;
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query).filter().sorted().fields();
    // features.filter();
    // features.sorted();
    // features.fields();
    await features.pagination(Model);

    const data = await features.query;
    // const data = await features.query.explain();

    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
    });
  });
