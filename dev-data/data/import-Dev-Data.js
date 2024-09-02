const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
// const Item = require('../../models/itemmodel');
const Review = require('../../models/reviewModel');
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
// const items = JSON.parse(fs.readFileSync(`${__dirname}/items.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
  try {
    // await Item.create(items);
    // await User.create(users, { validateBeforeSave: true });
    await Review.create(reviews);
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deletData = async () => {
  try {
    // await Item.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
  //node .\dev-data\data\import-Dev-Data.js --import
} else if (process.argv[2] === '--delete') {
  deletData();
  //node .\dev-data\data\import-Dev-Data.js --delete
}
console.log(process.argv);
