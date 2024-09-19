const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  message: { type: String, required: true },
  needTimeReview: { type: Boolean, required: true, default: true },
  timeForReview: { type: String, required: true },
  active: { type: Boolean, required: true, default: true },
});

const optionSchema = new mongoose.Schema({
  paymentMethod: { type: [paymentMethodSchema], required: true },
  logo: String,
  colors: String,
  headerStyle: String,
  footerStyle: String,
  dashboardStyle: String,
});

const Option = mongoose.model('Option', optionSchema);

module.exports = Option;
