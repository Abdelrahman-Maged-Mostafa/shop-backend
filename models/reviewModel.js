const mongoose = require('mongoose');
const Item = require('./itemmodel');

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
    item: {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      require: [true, 'Review must belong to a item'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
// we write this line of code to no one write over than 1 review in every tour that easy way to do it :)
reviewSchema.index({ item: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  //   this.populate({ path: 'item', select: 'name' });
  next();
});
// last thing in any folder after all meddle ware

reviewSchema.statics.calcAvrageRatings = async function (itemId) {
  const stats = await this.aggregate([
    { $match: { item: itemId } },
    { $group: { _id: '$item', nRatings: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);
  if (stats.length > 0) {
    await Item.findByIdAndUpdate(itemId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  }
  // else {
  //   await Item.findByIdAndUpdate(itemId, {
  //     ratingsQuantity: 0,
  //     ratingsAverage: 0,
  //   });
  // }
};

reviewSchema.post('save', function () {
  this.constructor.calcAvrageRatings(this.item);
});

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.findOne();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvrageRatings(this.r.item);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
