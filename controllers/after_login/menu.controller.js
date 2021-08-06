var Menu = require('./../../models/Menu');
var MenuQuantityMeasurePrice = require('./../../models/MenuQuantityMeasurePrice');
var MenuCategory = require('./../../models/MenuCategory');
var QuantityValue = require('./../../models/QuantityValue');
var MeasureValue = require('./../../models/MeasureValue');
var RestaurantMenuCategorySequence = require('./../../models/RestaurantMenuCategorySequence');

exports.getMenuCategoriesList =  async (req, res) => {
	var menuCategories = await MenuCategory.findAll({
		attributes: ['id', 'name'],
		where: {
			status: true
		}
	}).catch((err) => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
	if(!menuCategories || menuCategories === undefined){
		return res.status(404).send({ message: "Could not found menu categories." });
	}
	res.status(200).send({
		menuCategories: menuCategories
	});
};

exports.addMenuCategories = async (req, res, next, cb = null) => {
	if(!req.body.menuCategories || !(req.body.menuCategories && req.body.menuCategories.length > 0)){
		if(cb)
			return null;
		else return res.status(404).send({ message: "Menu categories list is missing" });
	}
	var menuCategoriesToSave = [];
	req.body.menuCategories.forEach((category, index)  => {
		menuCategoriesToSave.push({'name': category.toLowerCase()});
	});
	var savedMenuCategories = await MenuCategory.bulkCreate(menuCategoriesToSave);
	if(!savedMenuCategories || savedMenuCategories === undefined){
		if(cb)
			return null;
		else
			return res.status(404).send({ message: "Something happened while saving. couldn't save the menu categories" });
	}
	else{
		if(cb){
			return savedMenuCategories;
		}
		else{
			res.status(200).send({
				savedMenuCategories: savedMenuCategories
			});
		}
	}
};

exports.getQuantityMeasureValueList = async (req, res) => {
	var quantityValues = await QuantityValue.findAll({
		attributes: ['id', 'quantity'],
		where: {
			status: true
		}
	}).catch((err) => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
	if(!quantityValues || quantityValues === undefined){
		return res.status(404).send({ message: "Could not found quantity values." });
	}

	var measureValues = await MeasureValue.findAll({
		attributes: ['id', 'name'],
		where: {
			status: true
		}
	}).catch((err) => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
	if(!measureValues || measureValues === undefined){
		return res.status(404).send({ message: "Could not found measure values." });
	}

	res.status(200).send({
		quantityValues: quantityValues,
		measureValues: measureValues
	});
};

addQuantityValue = async (quantityValue) => {
	var quantityValueToSave = {
		quantity: quantityValue.toLowerCase()
	};
	var foundQuantityValue = await QuantityValue.findOne({
		where: quantityValueToSave
	});
	if(foundQuantityValue)
		return foundQuantityValue;
	var savedQuantityValue = await QuantityValue.create(quantityValueToSave);
	if(!savedQuantityValue || savedQuantityValue === undefined){
		return null;
	}
	else{
		return savedQuantityValue;
	}
};
addMeasureValue = async (measureValue) => {
	var measureValueToSave = {
		name: measureValue.toLowerCase()
	};
	var foundMeasureValue = await MeasureValue.findOne({
		where: measureValueToSave
	});
	if(foundMeasureValue)
		return foundMeasureValue;
	var savedMeasureValue = await MeasureValue.create(measureValueToSave);
	if(!savedMeasureValue || savedMeasureValue === undefined){
		return null;
	}
	else{
		return savedMeasureValue;
	}
};

addRestaurantMenuCategorySequences = async (restaurantBranchId, categoryId) => {
	var foundCategorySequence = null;
	foundCategorySequence = await RestaurantMenuCategorySequence.findOne({
		where: {
			restuarant_branch_id : restaurantBranchId,
			category_id : categoryId
		}
	});
	if(!foundCategorySequence){
		var foundDisplaysequence = await RestaurantMenuCategorySequence.findOne({
			attributes: ['display_sequence'],
			where: {
				restuarant_branch_id : restaurantBranchId
			},
			order: [
				['display_sequence', 'desc']
			],
		});

		if(foundDisplaysequence && foundDisplaysequence.display_sequence){
			var newDisplaySequence = foundDisplaysequence.display_sequence + 1;
		}
		else var newDisplaySequence = 1;

		var categorySequenceDataToSave = {
			'restuarant_branch_id': restaurantBranchId,
			'category_id': categoryId,
			'display_sequence': newDisplaySequence
		};
		var savedCategorySequence = await RestaurantMenuCategorySequence.create(categorySequenceDataToSave);
		if(!savedCategorySequence || savedCategorySequence === undefined)
			return false;
	}
	return true;
}

exports.updateMenuwithCategory = async(req, res) => {
	if(req.body.menuId){
		var foundMenu = await Menu.findOne({
			where: {
				id : req.body.menuId
			}
		});
		if(!foundMenu)
			return res.status(404).send({ message: "Couldn't found the Menu." });

		//updating category	
		var categoryId = req.body.categoryId;
		if(req.body.newCategoryName){
			req.body.menuCategories = [req.body.newCategoryName];
			var addedCategory = await this.addMenuCategories(req, res, null, true);
			if(!addedCategory || addedCategory === undefined){
				return res.status(404).send({ message: "Couldn't add the Menu category." });
			}
			categoryId = addedCategory[0].id;
		}
		var sequenceAdded = await addRestaurantMenuCategorySequences(req.body.restaurantBranchId, categoryId);
		if(!sequenceAdded)
			return res.status(404).send({ message: "Couldn't add the Menu category seuence." });

		if(!req.body.menuName || ((foundMenu.name.toLowerCase()).trim() === (req.body.menuName.toLowerCase()).trim())){
			var dataToUpdate = {};
			if(categoryId && categoryId !== undefined)
				dataToUpdate['category_id'] = categoryId;
			// if(req.body.menuName)
			// 	dataToUpdate['name'] = req.body.menuName;
			if(req.body.menuImageUrl)
				dataToUpdate['image'] = req.body.menuImageUrl;
			if(req.body.discount)
				dataToUpdate['discount'] = req.body.discount;
			if(req.body.description)
				dataToUpdate['description'] = req.body.description;
			if(req.body.shortDescription)
				dataToUpdate['short_description'] = req.body.shortDescription;
			if(req.body.menuType)
				dataToUpdate['menu_type'] = req.body.menuType;
			if(req.body.gst)
				dataToUpdate['gst'] = req.body.gst;
			if(req.body.priceIncludesGst)
				dataToUpdate['price_includes_gst'] = req.body.priceIncludesGst;
			var updatedMenu = await foundMenu.update(dataToUpdate);
			
		}
		else{

		}
	}
}

exports.createMenuwithCategory = async(req, res) => {
	var categoryId = req.body.categoryId;
	if(req.body.newCategoryName){
		req.body.menuCategories = [req.body.newCategoryName];
		var addedCategory = await this.addMenuCategories(req, res, null, true);
		if(!addedCategory || addedCategory === undefined){
			return res.status(404).send({ message: "Couldn't add the Menu category." });
		}
		categoryId = addedCategory[0].id;
	}
	var sequenceAdded = await addRestaurantMenuCategorySequences(req.body.restaurantBranchId, categoryId);
	if(!sequenceAdded)
		return res.status(404).send({ message: "Couldn't add the Menu category seuence." });

	var menuDataToSave = {
		'restuarant_branch_id': req.body.restaurantBranchId,
		'category_id': categoryId,
		'name': req.body.menuName,
		'image': req.body.menuImageUrl ? req.body.menuImageUrl : null,
		'discount': req.body.discount ? req.body.discount : 0,
		'description': req.body.description ? req.body.description : null,
		'short_description': req.body.shortDescription ? req.body.shortDescription : null,
		'menu_type': req.body.menuType ? req.body.menuType : null,
		'gst': req.body.gst ? req.body.gst : null,
		'price_includes_gst': req.body.priceIncludesGst ? req.body.priceIncludesGst : null
	};
	var addedMenu = await Menu.create(menuDataToSave);
	if(!addedMenu || addedMenu === undefined){
		return res.status(404).send({ message: "Couldn't add the menu details." });
	}
	
	var menuQuantityMeasurePriceDataToSave = [];
	var promises = req.body.priceDetails.map(async (priceDetail, index) => {
		if(priceDetail.newQuantityValueName){
			var addedQuantityValue = await addQuantityValue(priceDetail.newQuantityValueName);
			if(!addedQuantityValue || addedQuantityValue === undefined){
				return res.status(404).send({ message: "Couldn't add the quantity value." });
			}
		}
		if(priceDetail.newMeasureValueName){
			var addedMeasureValue = await addMeasureValue(priceDetail.newMeasureValueName);
			if(!addedMeasureValue || addedMeasureValue === undefined){
				return res.status(404).send({ message: "Couldn't add the measure value." });
			}
		}
		menuQuantityMeasurePriceDataToSave.push({
			'menu_id': addedMenu.id,
			'quantity_value_id': priceDetail.quantityValueId ? priceDetail.quantityValueId : addedQuantityValue.id,
			'measure_value_id': priceDetail.measureValueId ? priceDetail.measureValueId : addedMeasureValue.id,
			'price': priceDetail.originalPrice,
			'display_order': (index + 1)
		});
	});
	promises = await Promise.all(promises);
	var addedMenuQuantityMeasurePrice = await MenuQuantityMeasurePrice.bulkCreate(menuQuantityMeasurePriceDataToSave)
	if(!addedMenuQuantityMeasurePrice || addedMenuQuantityMeasurePrice === undefined){
		return res.status(404).send({ message: "Couldn't add the menu quantity measure price value details." });
	}
	return res.status(200).send({
		message: "Successfully uploaded the menu",
		addedMenu: addedMenu,
		addedMenuQuantityMeasurePrice: addedMenuQuantityMeasurePrice
	 });
}

/*
	Task descriptions:
	Discount price should be lesser than the original price
	convet to lowercase
	change app design to getting discount percentage
*/

// var AWS 				= require('aws-sdk');
// var fs 					= require('fs');
// AWS.config.update({accessKeyId: 'AKIA3626MXM24FBLV7NI', secretAccessKey: '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'});
// AWS.config.update({region: 'ap-south-1'});
// var s3 					= new AWS.S3();

// exports.uploadToS3 = (req, res) => {
// 	path='/Users/sharmiladevi/Dev/smart_diner/github/backend/juniorsri.png';
// 	fs.readFile(path, function(err, file_buffer){
//       var params = {
//         ACL         : 'public-read',
//         Bucket      : 'smartdiner-testing-uploads',
//         Key         : 'juniorsri.png',
//         Body        : file_buffer,
//         ContentType : 'image/jpeg'
//       };
//       s3.putObject(params, function(err, data) {
//         console.log(data);
//         console.log(err);
//        });
//     });
// }




