const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name'] },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: [true, 'This email aready have account'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a vaild email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: { type: String, enum: ['user', 'guide', 'admin', 'lead-guide'], default: 'user' },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    maxlength: [40, 'A tour name must have less than 41 characters'],
    minlength: [8, 'Password should be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  active: { type: Boolean, default: true, select: false },
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// to maked hashed password
userSchema.pre(`save`, async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  if (!this.isNew) {
    // i - 3000 from now becouse i want to sure passwordchangedat created before jwt
    this.passwordChangedAt = Date.now() - 3000;
  }
  next();
});
//check this password is correct ?
userSchema.methods.correctPassword = async function (curpass, userpass) {
  return await bcrypt.compare(curpass, userpass);
};
// check this user login before changing password or not
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (
    this.passwordChangedAt &&
    parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JWTTimeStamp
  )
    return true;
  return false;
};
//make token to forget password
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//any middelware should write before anilization the mongoose.model
const User = mongoose.model('User', userSchema);

//your json backege
//    "start:dev": "nodemon server.js",
//    "start:prod": "SET NODE_ENV=production & nodemon server.js"
module.exports = User;
