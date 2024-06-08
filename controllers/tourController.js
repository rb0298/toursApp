const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`) // read the data from file during the top level code execution
);

// middleware attached to router.param will have excess to four values
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  //error handling
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};

//to check the data in body is valid or not before processing it
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  // to read the parameter from url
  console.log(req.params);
  // to convert it to number
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  // data sending in Jsend format
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);

  // to determine id as data is written in fictional database
  const newId = tours[tours.length - 1].id + 1;
  //merging and creating new objects
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  //201 if data is successfully added
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  // default success status
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  // 204 if no data is send
  res.status(204).json({
    status: 'success',
    data: null
  });
};
