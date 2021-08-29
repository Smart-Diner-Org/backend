const express = require("express");
var router = express.Router();
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
var Restaurant = require('./../models/Restaurant');
var helper = require('./../helpers/general.helper');
var cors = require("cors");
var corsOptions;

Restaurant.findAll({
  where: {
    status: true
  },
  attributes: ['url']
})
.then((restaurants) => {
	var urls = helper.getCorsUrlsList(restaurants);
	//corsOptions = helper.getCorsFunction(urls);
	corsOptions = '*';

	//Define all routes here
	router.post('/check_for_account', [cors(corsOptions), verifySignUp.checkForMobileAndRole],  controller.checkAccount);
	router.post(
	'/signup',
	[
		cors(corsOptions),
		verifySignUp.checkDuplicateMobileOrEmail,
		verifySignUp.checkRolesExisted
	],
	controller.signup
	);
	router.post("/signin", 
		cors(corsOptions),
		controller.signin);
	router.post("/verify_otp", [cors(corsOptions), verifySignUp.checkForMobileAndOtp], controller.verifyOtp);
	router.post("/resend_otp", [cors(corsOptions), verifySignUp.checkForMobile], controller.resendOtp);
})
.catch(err => console.log(err));
module.exports = router;


