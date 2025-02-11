const dotenv = require('dotenv');
const mongoose = require('mongoose');

//to configure variables present in config.env file to our process/environment/application
dotenv.config({ path: './config.env' });

// it should be right at top to catch unhandle exception happening in our code
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
  // we don.t need server as the error is not catched in it asynchronously as it will only catch error while synchronously running the code
});

const app = require('./app');

const url = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Add this line if you are using indexes
    useFindAndModify: false // Add this line if you are using findOneAndUpdate() or findOneAndRemove()
  })
  .then(() => {
    console.log('Connected to MongoDB');
  });
// .catch(err => {
//   console.error('Error connecting to MongoDB', err);
// });

// to read the value of environment variables
const port = process.env.PORT || 3000;

//server is listening to the request
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 💥 shutting down...');
  server.close(() => process.exit(1));
});
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
