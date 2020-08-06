const express = require("express");
var router = express.Router();
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

router.post('/check_for_account', [verifySignUp.checkForMobileAndRole],  controller.checkAccount);
router.post(
  '/signup',
  [
    verifySignUp.checkDuplicateMobileOrEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signup
);
router.post("/signin", controller.signin);
router.post("/verify_otp", [verifySignUp.checkForMobileAndOtp], controller.verifyOtp);
router.post("/resend_otp", [verifySignUp.checkForMobile], controller.resendOtp);
module.exports = router;


