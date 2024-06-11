const dotenv = require('dotenv');
const mongoose = require('mongoose');

//to configure variables present in config.env file to our process/environment/application
dotenv.config({ path: './config.env' });
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
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

// to read the value of environment variables
const port = process.env.PORT || 3000;

//server is listening to the request
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
