// morgan- for logging the results and express framework to manage complex routing
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  // to register middleware in middleware stacks
  app.use(morgan('dev'));
}

//to add data to the req object
app.use(express.json());

//  to process or access the static files like template, image
app.use(express.static(`${__dirname}/public`));

//custom middleware function passed in app.use is registered to middleware stack and it get access to req,res and next params
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// to add custom data to the req object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// 3) ROUTES

// to add Router to our middleware stack tourROUTER will only be executed when it matches the url
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  // const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  // error.statusCode = 404;
  // error.status = 'fail';

  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });
  next(error);
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
