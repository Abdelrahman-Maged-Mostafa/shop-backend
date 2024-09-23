const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A item must have a name'],
      trim: true,
      maxlength: [40, 'A item name must have less than 41 characters'],
      minlength: [3, 'A item name must have more than 9 characters'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating should be above 0'],
      max: [5, 'Rating should be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number },
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
    createdAt: { type: Date, default: Date.now() },
    category: { type: [String], required: [true, 'A item must have a category'] }, // Allow multiple categories
    stock: {
      type: Number,
    },
    properties: {
      colorsAndSize: [
        {
          name: { type: String },
          sizes: [
            {
              name: { type: String },
              price: { type: Number },
              stock: { type: Number },
            },
          ],
        },
      ],
      sizes: [
        {
          name: { type: String },
          price: { type: Number },
          stock: { type: Number },
        },
      ],
      colors: [
        {
          name: { type: String },
          price: { type: Number },
          stock: { type: Number },
        },
      ],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

itemSchema.index({ price: 1 });
itemSchema.index({ price: 1, ratingsAverage: -1 });
itemSchema.virtual('reviews', { ref: 'Review', foreignField: 'item', localField: '_id' });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
