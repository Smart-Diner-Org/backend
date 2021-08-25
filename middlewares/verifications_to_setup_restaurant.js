const Customer = require("../models/Customer");
const CustomerDetail = require("../models/CustomerDetail");
const authJwt = require("./auth_jwt.js");
var constants = require('./../config/constants');
var RestaurantBranch = require('../models/RestaurantBranch');
var QuantityValue = require('../models/QuantityValue');
var MeasureValue = require('../models/MeasureValue');
var MenuCategory = require('../models/MenuCategory');

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
	next();
};

exports.checkAttributesToCreateRestaurantWebsiteDetails = (req, res, next) => {
	req.body.isPreBookingTimeRequired = false;
	if(req.body.isPrebookingEnabled){
		if(req.body.preBookPriorTime && req.body.preBookPriorTime > 0){
			req.body.isPreBookingTimeRequired = true;
		}
		else return res.status(404).send({ message: "Restaurant's pre book prior time is missing" });
	}

	// if(!(req.body.sliderImages && req.body.sliderImages.length > 0)){
	// 	return res.status(404).send({ message: "Restaurant slider image is missing" });
	// }
	// else{
	// 	var sliderImage = req.body.sliderImages[0];
	// 	if(!sliderImage.url) return res.status(404).send({ message: "Restaurant slider image url missing" });
	// }
	if(req.body.sliderImages && req.body.sliderImages.length > 0){
		if(!(req.body.sliderImages[0] && req.body.sliderImages[0].url))
			return res.status(404).send({ message: "Restaurant slider image url missing" });
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
};

exports.canAddEditMenuWithCategories = (req, res, next) => {
	if(!(req.roleId === constants.roles.smartDinerSuperAdmin || req.roleId === constants.roles.superAdmin)){
		return res.status(403).send({
        	message: "Required proper role to access. You are not allowed to access."
      	});
	}
	next();
}

exports.checkAttributesToAddEditMenuWithCategories = async (req, res, next) => {
	if(!req.body.restaurantBranchId)
		return res.status(403).send({
        	message: "Restaurant branch id is missing."
      	});
	if(!req.body.menuName)
		return res.status(403).send({
        	message: "Menu name is missing."
      	});
	if(!(req.body.categoryId || req.body.newCategoryName))
		return res.status(403).send({
        	message: "Information about the menu category is missing."
      	});
	if((req.body.categoryId && req.body.newCategoryName))
		return res.status(403).send({
        	message: "Send either menu category id or new menu category name. Not both."
      	});
	if(!(req.body.priceDetails && req.body.priceDetails.length > 0))
		return res.status(403).send({
        	message: "Price detail is missing"
      	});
	if(!req.body.priceDetails[0].originalPrice)
		return res.status(403).send({
        	message: "Original price is missing."
      	});
	if(!(req.body.priceDetails[0].quantityValueId || req.body.priceDetails[0].newQuantityValueName))
		return res.status(403).send({
        	message: "Information about the quantity value is missing."
      	});
	if((req.body.priceDetails[0].quantityValueId && req.body.priceDetails[0].newQuantityValueName))
		return res.status(403).send({
        	message: "Send either quantity value id or new quantity value name. Not both."
      	});
	if(!(req.body.priceDetails[0].measureValueId || req.body.priceDetails[0].newMeasureValueName))
		return res.status(403).send({
        	message: "Information about the measure value is missing."
      	});
	if((req.body.priceDetails[0].measureValueId && req.body.priceDetails[0].newMeasureValueName))
		return res.status(403).send({
        	message: "Send either measure value id or new measure value name. Not both."
      	});

	var restaurantBranch = await RestaurantBranch.findOne({
		where: {
			id: req.body.restaurantBranchId
		}
	});
	if(!restaurantBranch || restaurantBranch === undefined)
		return res.status(404).send({ message: "Restaurant branch id mismatch." });
	var categoryDetail = null, quantityValueDetail = null, measureValueDetail = null;
	if(req.body.categoryId){
		categoryDetail = await MenuCategory.findOne({
			where: {
				id: req.body.categoryId
			}
		});
		if(!categoryDetail || categoryDetail === undefined)
			return res.status(404).send({ message: "Menu category id mismatch." });
	}
	if(req.body.priceDetails[0].quantityValueId){
		quantityValueDetail = await QuantityValue.findOne({
			where: {
				id: req.body.priceDetails[0].quantityValueId
			}
		});
		if(!quantityValueDetail || quantityValueDetail === undefined)
			return res.status(404).send({ message: "Quantity value id mismatch." });
	}
	if(req.body.priceDetails[0].measureValueId){
		measureValueDetail = await MeasureValue.findOne({
			where: {
				id: req.body.priceDetails[0].measureValueId
			}
		});
		if(!measureValueDetail || measureValueDetail === undefined)
			return res.status(404).send({ message: "Measure value id mismatch." });
	}
	next();
}

