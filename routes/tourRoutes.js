const express = require('express');
// contains all the Route handler functions
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//To create Router
const router = express.Router();

// if the resource  has a param of id, it will call this middlware func
// router.param('id', tourController.checkID);

// '/' corrresponds to sub application or resource for which we are handling the route '/'='api/v1/tours'
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/montly-plan/:year').get(tourController.getMontlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //if request has get http method route handler will be executed which is a middleare function
  .post(tourController.createTour);

router
  .route('/:id') // if route has add as a parameter
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
