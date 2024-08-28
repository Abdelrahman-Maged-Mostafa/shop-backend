const mongoose = require('mongoose');
const Tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, require: [true, 'Review can not be empty'] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now() },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
// we write this line of code to no one write over than 1 review in every tour that easy way to do it :)
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  //   this.populate({ path: 'tour', select: 'name' });
  next();
});
// last thing in any folder after all meddle ware

reviewSchema.statics.calcAvrageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    { $group: { _id: '$tour', nRatings: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAvrageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.findOne();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvrageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
