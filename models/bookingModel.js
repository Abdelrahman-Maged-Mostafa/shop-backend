const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Booking must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Booking must belong to a user'],
    },
    price: { type: Number, require: [true, 'Booking must have a price'] },
    createdAt: { type: Date, default: Date.now() },
    paid: { type: Boolean, default: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
// we write this line of code to no one write over than 1 review in every tour that easy way to do it :)

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo email' });
  this.populate({ path: 'tour', select: 'name' });
  //   this.populate({ path: 'tour', select: 'name' });
  next();
});
// last thing in any folder after all meddle ware

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
