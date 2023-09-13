const router = require('express').Router();
const adminController = require('../Controller/admin');
const Auth = require('../middleware/auth')


router.post('/register', adminController.createAdmin);

router.get('/login', adminController.getAdmin);

router.get('/logout', Auth, adminController.logoutAdmin);

router.patch('/changePass', Auth, adminController.passChange);


module.exports = router;