const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Item = require('../../models/itemmodel');
const Review = require('../../models/reviewModel');
const Option = require('../../models/optionModel');
// const User = require('../../models/userModel');
/////////////////////////////// run server
dotenv.config({ path: './config.env' }); //should be before app require
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((connection) => {
    console.log(connection.connections[0].base.connections[0].user);
  });
//Read Json File
const items = JSON.parse(fs.readFileSync(`${__dirname}/items.json`, 'utf-8'));
const options = JSON.parse(fs.readFileSync(`${__dirname}/options.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
/////////////fake data

//////////////////////
exports.importData = async () => {
  try {
    await Item.create(items);
    // fs.writeFileSync(`${__dirname}/reviews.json`, JSON.stringify(reviews), 'utf-8');
    await Option.create(options);
    await Option.deleteMany({ _id: { $ne: options[0]._id } });
    // await User.create(users, { validateBeforeSave: true });
    await Review.create(reviews);
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  // process.exit();
};

exports.deletData = async () => {
  try {
    await Item.deleteMany();
    await Option.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  // process.exit();
};

if (process.argv[2] === '--import') {
  // importData();
  //node .\dev-data\data\import-Dev-Data.js --import
} else if (process.argv[2] === '--delete') {
  // deletData();
  //node .\dev-data\data\import-Dev-Data.js --delete
}
console.log(process.argv);
///Under Fake Reviews
/// other fake data
// function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// const usersId = JSON.parse(fs.readFileSync(`${__dirname}/idUsers.json`, 'utf-8'));
// const itemsId = JSON.parse(fs.readFileSync(`${__dirname}/idItems.json`, 'utf-8'));
// const reviewTexts = [
//   'This product exceeded my expectations in every way.',
//   'I found this item to be very useful and of high quality.',
//   "The product works as advertised and I'm very satisfied.",
//   'Great value for the price. Highly recommend!',
//   'The quality is top-notch and it arrived on time.',
//   "I'm very happy with this purchase. Will buy again.",
//   'This item is exactly what I needed. Perfect!',
//   'The product is good, but the delivery was a bit slow.',
//   'Excellent product, but it could be a bit cheaper.',
//   "I'm impressed with the build quality and performance.",
//   'This is a must-have item for anyone in need of it.',
//   "The product is decent, but I've seen better.",
//   'Overall, a good purchase. Satisfied with the quality.',
//   "The item is okay, but it didn't meet all my expectations.",
//   'Fantastic product! Works like a charm.',
//   'The product is reliable and easy to use.',
//   "I'm pleased with the purchase. Good quality.",
//   'The item is well-made and functions as expected.',
//   'Great product, but the packaging could be improved.',
//   "I'm happy with the product, but it took a while to arrive.",
//   'The product is excellent, but the customer service was lacking.',
//   'This item is worth every penny. Highly recommend!',
//   'The quality is good, but the price is a bit high.',
//   "I'm satisfied with the product, but it could be better.",
//   'The product is great, but the instructions were unclear.',
//   'Overall, a good buy. Would recommend to others.',
//   'The item is functional, but not exceptional.',
//   "I'm happy with the purchase. It meets my needs.",
//   "The product is decent, but there's room for improvement.",
//   'Great value for money. Very satisfied with the purchase.',
// ];

// const reviews = [];

// itemsId.forEach((item) => {
//   const numberOfReviews = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
//   const shuffledUsers = usersId.sort(() => 0.5 - Math.random()).slice(0, numberOfReviews);

//   shuffledUsers.forEach((user) => {
//     const reviewText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
//     const rating = Math.floor(Math.random() * 3) + 3;

//     reviews.push({
//       review: reviewText,
//       rating: rating,
//       user: user,
//       item: item,
//       createdAt: new Date(Date.now() - getRandomInt(0, 10000000000)).toISOString(),
//     });
//   });
// });
