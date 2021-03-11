const Customer = require("../models/Customer");
const CustomerDetail = require("../models/CustomerDetail");
const authJwt = require("./auth_jwt.js");
var constants = require('./../config/constants');

exports.checkForAccountHolderName = (req, res, next) => {
	if(!req.body.name){
		return res.status(404).send({ message: "Account holder name is missing" });
	}
	next();
};

exports.checkForPassword = (req, res, next) => {
	if(!req.body.password){
		return res.status(404).send({ message: "Password is missing" });
	}
	req.isfromManualRestaurantSetup = true;
	next();
};

exports.checkAttributesForToCreateRestaurant = (req, res, next) => {
	if(!req.body.restaurantName){
		return res.status(404).send({ message: "Restaurant name is missing" });
	}
	// if(!req.body.templateId){
	// 	return res.status(404).send({ message: "Restaurant name is missing" });
	// }
	// if(!req.body.restaurantName){
	// 	return res.status(404).send({ message: "Restaurant name is missing" });
	// }
	// if(!req.body.restaurantName){
	// 	return res.status(404).send({ message: "Restaurant name is missing" });
	// }
	// if(!req.body.restaurantName){
	// 	return res.status(404).send({ message: "Restaurant name is missing" });
	// }
	// if(!req.body.restaurantName){
	// 	return res.status(404).send({ message: "Restaurant name is missing" });
	// }

	next();
};

exports.checkAttributesForToCreateRestaurantBranches = (req, res, next) => {
	var attributeNotFound = false;
	if(!(req.body.branches && req.body.branches.length > 0)){
		return res.status(404).send({ message: "Restaurant branch is missing. At least one branch needed" });
	}
	else{
		var branch = req.body.branches[0];
		if(!branch.branchName) return res.status(404).send({ message: "Restaurant branch name missing" });
		if(!branch.branchAddress) return res.status(404).send({ message: "Restaurant branch address missing" });
		if(!branch.branchStateId) return res.status(404).send({ message: "Restaurant branch branch state missing" });
		if(!branch.branchContactNumber) return res.status(404).send({ message: "Restaurant branch contact number missing" });
		if(!branch.branchCityId) return res.status(404).send({ message: "Restaurant branch city missing" });
		
	}
	console.log("inside checkAttributesForToCreateRestaurantBranches");
	next();
};


	// restaurant_id  NOT NULL,
    // is_pre_booking_enabled boolean NOT NULL DEFAULT true,
    // is_pre_booking_time_required boolean NOT NULL DEFAULT true,
    // is_pick_my_location_enabled boolean NOT NULL DEFAULT true,
    // is_payment_gateway_enabled boolean NOT NULL DEFAULT true,
    // is_cod_enabled boolean NOT NULL DEFAULT false,
    // page_description text COLLATE pg_catalog."default",
    // slider_images text COLLATE pg_catalog."default",
    // ga_tracking_id text COLLATE pg_catalog."default",
    // about_image text COLLATE pg_catalog."default",
    // pre_order_info_image text COLLATE pg_catalog."default",
    // is_run_time_booking_enabled boolean NOT NULL DEFAULT true,
    // pre_book_prior_time integer,
    // primary_colour_code character varying COLLATE pg_catalog."default",
    // secondary_colour_code character varying COLLATE pg_catalog."default",
    // has_customisation_info boolean,
    // customisation_info_content text COLLATE pg_catalog."default",
    // cards text COLLATE pg_catalog."default",
    // is_delivery_available boolean DEFAULT true,
    // page_title text COLLATE pg_catalog."default",


exports.checkAttributesToCreateRestaurantWebsiteDetails = (req, res, next) => {
	req.body.isPreBookingTimeRequired = false;
	if(req.body.isPrebookingEnabled){
		if(req.body.preBookPriorTime && req.body.preBookPriorTime > 0){
			req.body.isPreBookingTimeRequired = true;
		}
		else return res.status(404).send({ message: "Restaurant's pre book prior time is missing" });
	}

	if(!(req.body.sliderImages && req.body.sliderImages.length > 0)){
		return res.status(404).send({ message: "Restaurant slider image is missing" });
	}
	else{
		var sliderImage = req.body.sliderImages[0];
		if(!sliderImage.url) return res.status(404).send({ message: "Restaurant slider image url missing" });
	}

	if(!req.body.isCodEnabled && !req.body.isOnlinePaymentEnabled){
		return res.status(404).send({ message: "At least one payment option should be added" });
	}

	if(!req.body.getLocationPlaceId && !req.body.getLocationTypeId){
		return res.status(404).send({ message: "Get location association is missing" });
	}
	if(!((req.body.getLocationPlaceId == constants.getLocationPlaces.beforeAddToCart && req.body.getLocationTypeId == constants.getLocationTypes.googleLocation)
		|| (req.body.getLocationPlaceId == constants.getLocationPlaces.whileAddingAddress && req.body.getLocationTypeId == constants.getLocationTypes.dropdownLocation)))
		return res.status(404).send({ message: "The given association is not supported yet" });
	next();
};

exports.canSetupRestaurant = (req, res, next) => {
	if(authJwt.canAccessAllRestaurants || authJwt.isSuperAdmin){
		next();
	}
	return res.status(404).send({ message: "You are not allowed to set the restaurant" });
};