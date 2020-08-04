const express = require("express");
var router = express.Router();
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

router.post(
  '/signup',
  [
    verifySignUp.checkDuplicateMobileOrEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signup
);
router.post("/signin", controller.signin);
router.post("/verify_otp", controller.signinViaOtp);
router.post("/resend_otp", controller.resendOtp);
module.exports = router;
