const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A item must have a name'],
      trim: true,
      maxlength: [40, 'A item name must have less than 41 characters'],
      minlength: [10, 'A item name must have more than 9 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contains characters'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be above 1.0'],
      max: [5, 'Rating should be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A item must have a price'] },
    // priceDescount: {
    //   type: Number,
    //   validate: {
    //     validator: function (val) {
    //       return val < this.price;
    //     },
    //     message: 'Discount price ({VALUE}) should be below regular price',
    //   },
    // },
    shortDescription: {
      type: String,
      trim: true,
      required: [true, 'A item must have a shortDescription'],
    },
    longDescription: {
      type: String,
      trim: true,
      required: [true, 'A item must have a longDescription'],
    },
    imageCover: { type: String, required: [true, 'A item must have a cover image'] },
    images: { type: [String] },
    createdAt: { type: Date, default: Date.now(), select: false },
    stock: {
      type: Number,
      required: [true, 'A item must have a stock'],
    },
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Reviews' }],
    //   rating: { type: Number, default: 4.5 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// tourSchema.index({ price: 1 });
itemSchema.index({ price: 1, ratingsAverage: -1 });

// this for get all reviewss from reviews in data base this will combare the tour id vs the id in every review in tour field becouse that we write tour in foreignField and in localField write _id
itemSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
