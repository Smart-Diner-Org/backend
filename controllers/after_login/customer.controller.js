var Customer = require('./../../models/Customer');
// var MenuCategory = require('./../../models/MenuCategory');
// var Restaurant = require('./../../models/Restaurant');
var constants = require('./../../config/constants');
var CustomerDetail = require('./../../models/CustomerDetail');
// var RestaurantBranch = require('./../../models/RestaurantBranch');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var _ = require('underscore');

exports.updateCustomerDetails = (req, res) => {
	Customer.findOne({
		where: {
			id: req.customerId
		},
		include:[
			{ model: CustomerDetail, as: 'customer_detail', required: false }
		]
	})
	.then(customer => {
		if (!customer) {
			return res.status(404).send({ message: "User not found." });
		}
		console.log("customer data");
		console.log(customer);
		if(!customer.customer_detail){
			if(!req.body.address || !req.body.cityId || !req.body.stateId){
				return res.status(500).send({ message: "Address information is missing" });
			}
			var dataToCreate = {
				customer_id : customer.id,
				address : req.body.address,
				city_id : req.body.cityId,
				state_id : req.body.stateId,
				lat : req.body.latitude,
				long : req.body.longitude
			};
			CustomerDetail.create(dataToCreate);
		}
		else{
			var dataToUpdate = {};
			if(req.body.address)
				dataToUpdate['address'] = req.body.address;
			if(req.body.cityId)
				dataToUpdate['city_id'] = req.body.cityId;
			if(req.body.stateId)
				dataToUpdate['state_id'] = req.body.stateId;
			if(req.body.latitude)
				dataToUpdate['lat'] = req.body.latitude;
			if(req.body.longitude)
				dataToUpdate['long'] = req.body.longitude;
			customer.customer_detail.update(dataToUpdate);
		}
		res.status(200).send({
	        message: "Successfully updated the customer details"
		});
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});

	/*Customer.findById(req.customerId)
    .then(user => {
    	if (!user) {
			return res.status(404).send({ message: "User not found." });
		}
		CustomerDetail.findOne({
			where: {
				customer_id: user.id
			}
		})
		.then(customerDetail => {
			if (!customerDetail) {
				var dataToCreate = {
					customer_id : user.id
					address : req.body.address,
					city_id : req.body.cityId
					state_id : req.body.stateId,
					lat : req.body.latitude,
					long : req.body.longitude
				};
				CustomerDetail.create(dataToCreate)
			}
			else{
				var dataToUpdate = {};
				if(req.body.address)
					dataToUpdate['address'] = req.body.address;
				if(req.body.cityId)
					dataToUpdate['city_id'] = req.body.cityId;
				if(req.body.stateId)
					dataToUpdate['state_id'] = req.body.stateId;
				if(req.body.latitude)
					dataToUpdate['lat'] = req.body.latitude;
				if(req.body.longitude)
					dataToUpdate['long'] = req.body.longitude;
				customerDetail.update(dataToUpdate);
			}
			res.status(200).send({
		        customerDetail: customerDetail
			});
	    })
	    .catch(err => console.log(err));
		// res.status(200).send("Public Content.");
	})
	.catch(err => {
      res.status(500).send({ message: err.message });
    });*/
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.superAdminBoard = (req, res) => {
  res.status(200).send("Super Admin Content.");
};