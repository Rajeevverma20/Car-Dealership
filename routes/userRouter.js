const express = require('express'); // Change to `const express = require('express').Router();`
const router = express.Router(); // Correctly initialize the router
const UserController = require('../Controller/user');
const Auth = require('../middleware/auth');

router.post('/register', UserController.registerUser);

router.get('/login', UserController.getUser);

router.delete('/logout', Auth, UserController.logoutUser);

router.patch('/change-password', Auth, UserController.passUser);

router.get('/cars', Auth, UserController.getAllcars);

router.get('/cars-in-dealership/:dealershipId', Auth, UserController.viewCarsInDealership); // Correct the route parameter

router.get('/dealership-with-cars/:carId', Auth, UserController.viewDealershipsWithCar);

router.get('/owned-vehicles/:userId', Auth, UserController.viewOwnedVehicles);

router.get('/deals-on-car/:carId', Auth, UserController.viewDealsOnCar);

router.get('/deals-from-dealership/:dealershipId', Auth, UserController.viewDealsFromDealership);

module.exports = router;
