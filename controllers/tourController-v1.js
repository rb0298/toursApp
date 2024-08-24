// const fs = require('fs');
const { json } = require('express');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

//reading the data from the file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`) // read the data from file during the top level code execution
// );

// middleware attached to router.param will have excess to four values

// WE will work with mongo which will automatically check the id
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   //error handling
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

//to check the data in body is valid or not before processing it
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};

exports.getAllTours = async (req, res) => {
  // to find all the tours
  // smart enough to cnvert it back to array of javascript onjects
  // take all the work away from us
  try {
    // 1) Filtering
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];

    // excludeFields.forEach(el => delete queryObj[el]);

    // // not able to understand why i have use await below let's see in future
    // //build the query
    // // {difficulty:"easy",duration:{$gte:5}}
    // console.log(req.query);
    // // REPLACING gt,gte,lt,lte
    // // 2ND Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    // console.log(queryStr);
    // when we pass empty object it will return all the values
    // let query = Tour.find(JSON.parse(queryStr));
    // console.log(typeof query);
    // 3 Sorting\
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');

    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }
    // if (req.query.fields) {
    //   const selectedFields = req.query.fields.split(',').join(' ');
    //   query = query.select(selectedFields);
    // } else {
    //   query = query.select('-__v');
    // }

    //4 Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // console.log(skip, limit);
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error("This page doesn't exist");
    // }

    //Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const tours = await features.query;
    //send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'failure to access the data'
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const query = Tour.findById(req.params.id);
    //same can be achieved using Tour.findOne({_id:req.params.id})
    // above is hort hand of below

    // const tour = tours.find(el => el.id === id);

    // data sending in Jsend format
    const tour = await query;
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'failure to access the data'
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // One way of creating the tour
    // const newTour = new Tour({});
    // newTour.save();

    //2nd way of creating the tour call method directly on model
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  // default success status
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const data = await Tour.findByIdAndRemove(req.params.id);
    // 204 if no data is send
    res.status(204).json({
      status: 'success',
      data
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          // _id: '$difficulty',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' }
      //   }
      // }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

//to caluclate busiest month for a given year
// perform with the help of aggregate function of mongoose

exports.getMontlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numTourStarts: -1
        }
      },
      {
        $limit: 12
      }
    ]);
    console.log(year);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
