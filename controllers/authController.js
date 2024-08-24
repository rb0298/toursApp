const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const verifyToken = (token, secretKey) => {
  return new Promise((res, rej) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return rej(err);
      res(decoded);
    });
  });
};

// name signyp not createuser as it is realted to authentication
exports.signup = catchAsync(async function(req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
    passwordChangedAt: req.body.passwordChangedAt
  });
  // 201 created
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token
  });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password:', 400));
  const user = await User.findOne({ email }).select('+password');

  //401 unauthorized access
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError('Please  provide correct email or password:', 401)
    );
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  if (!token)
    return next(
      new AppError(
        'You are not logged in! Please log in to get the access',
        401
      )
    );

  // 2) validate the token
  const decoded = await verifyToken(token, process.env.JWT_SECRET);

  //3) check if user still exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to the token does not exist', 401)
    );
  console.log(freshUser);
  if (freshUser.passwordChangedAt) {
    if (freshUser.changedPasswordAfter(decoded.iat))
      return next(
        new AppError(
          'Your login has exipred! Please log in again to get the access',
          401
        )
      );
  }

  // 4) Check if user changed password after the JWT token was issued
  req.user = freshUser;
  next();
});
