const dotenv = require('dotenv');

//to configure variables present in config.env file to our process/environment/application
dotenv.config({ path: './config.env' });
const app = require('./app');

// to read the value of environment variables
const port = process.env.PORT || 3000;

//server is listening to the request
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
