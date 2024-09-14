const mongoose = require('mongoose');

// Define the Item schema
const ItemSchema = new mongoose.Schema({
  properties: {
    color: String,
    size: String,
    price: Number,
    quantity: Number,
  },
  item: { type: mongoose.Schema.ObjectId, ref: 'Item' },
});

// Define the Order schema
const OrderSchema = new mongoose.Schema({
  paymentMethod: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  transactionID: { type: String, required: true },
  items: [ItemSchema],
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['underReview', 'completedPayment', 'completedOrder'],
    default: 'underReview',
  },
});

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
