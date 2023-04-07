const Router = require("express");
const controller = require("./controller")
const router = Router();

router.get('/homePage', controller.getHomePage);
router.get('/login', controller.checkAutheticated, controller.getLoginPage);
router.post('/login', controller.checkLogin);
router.get('/logout', controller.logout);
router.post('/register', controller.reqBody);
router.get('/register',controller.checkAutheticated, controller.getRegisterPage);
router.get('/profile', controller.checkNotAuthenticated, controller.getProfile);
router.get('/resetPassword', controller.getResetPasswordPage);
router.post('/resetPassword', controller.checkResetPassword);
router.get('/reset-password/:token', controller.verifyToken);
router.post('/reset-password', controller.reqPass);

module.exports = router;

