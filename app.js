// morgan- for logging the results and express framework to manage complex routing
const express = require('express');
const morgan = require('morgan');

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
  next();
});

// 3) ROUTES

// to add Router to our middleware stack tourROUTER will only be executed when it matches the url
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
