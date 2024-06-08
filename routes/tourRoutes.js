const express = require('express');
// contains all the Route handler functions
const tourController = require('./../controllers/tourController');
//To create Router
const router = express.Router();

// if the resource  has a param of id, it will call this middlware func
router.param('id', tourController.checkID);

// '/' corrresponds to sub application or resource for which we are handling the route '/'='api/v1/tours'
router
  .route('/')
  .get(tourController.getAllTours) //if request has get http method route handler will be executed which is a middleare function
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id') // if route has add as a parameter
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
