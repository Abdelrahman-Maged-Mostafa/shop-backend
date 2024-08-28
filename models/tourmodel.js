const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: [true, 'This name our tour we have'],
      trim: true,
      maxlength: [40, 'A tour name must have less than 41 characters'],
      minlength: [10, 'A tour name must have more than 9 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contains characters'],
    },
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: { type: Number, required: [true, 'A tour must have a Group Size'] },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be above 1.0'],
      max: [5, 'Rating should be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDescount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: { type: String, trim: true, required: [true, 'A tour must have a summary'] },
    description: { type: String, trim: true },
    imageCover: { type: String, required: [true, 'A tour must have a cover image'] },
    images: { type: [String] },
    startDates: { type: [Date] },
    createdAt: { type: Date, default: Date.now(), select: false },
    slug: { type: String },
    secretTour: { type: Boolean, default: false, select: false },
    startLocation: {
      //format Location in mongoDB geoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Reviews' }],
    //   rating: { type: Number, default: 4.5 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// this for get all reviewss from reviews in data base this will combare the tour id vs the id in every review in tour field becouse that we write tour in foreignField and in localField write _id
tourSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' });

//Document middleware run before save and creat
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//if you do this you will get some problems because you save this imdetly users data and if this data changed not changed in tours you nee alot of work after this to solve this problems.
//   const guidesPromisess = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromisess);
//   next();
// });

//Document middleware run after save and creat
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(Date.now() - this.start);
  next();
});

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
//aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

//your json backege
//    "start:dev": "nodemon server.js",
//    "start:prod": "SET NODE_ENV=production & nodemon server.js"
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));
