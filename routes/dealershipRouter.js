const router = require('express').Router();
const DealershipController = require('../Controller/dealership');
const Auth = require('../middleware/auth');

router.post('/register', DealershipController.createDealer);

router.get('/login', DealershipController.login);

router.get('/logout', Auth, DealershipController.logout);

router.patch('/changePass', Auth, DealershipController.changePass);

// Corrected route parameters here
router.get('/:dealershipId/sold-cars', Auth, DealershipController.getSoldCarsByDealership);

router.post('/:dealershipId/cars', Auth, DealershipController.createCars);

router.get('/:dealershipId/Allcars', Auth, DealershipController.getAllCarsByDealership);

router.get('/:dealershipId/deals', Auth, DealershipController.getDealsByDealership);

router.post('/:dealershipId/deals', Auth, DealershipController.addDealToDealership);

router.get('/:dealershipId/sold-vehicles', Auth, DealershipController.getSoldVehiclesByDealership);

router.post('/:dealershipId/add-sold-vehicle', Auth, DealershipController.addSoldVehicle);

module.exports = router;
