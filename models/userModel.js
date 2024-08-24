const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(val) {
        // This only works on CREATE AND SAVE
        return this.password === val;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  photo: {
    type: String
  }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// instance method(method available on directly on doc (eq not extact but can relate to method attached to a proptoype property of a schema))
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // candidatepassword- entered by user
  // func return true or false

  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function(JWTtimestamp) {
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  return JWTtimestamp < changedTimestamp;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
