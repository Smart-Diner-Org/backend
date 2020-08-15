var Customer = require('./../../models/Customer');
var constants = require('./../../config/constants');
var CustomerDetail = require('./../../models/CustomerDetail');
var State = require('./../../models/State');
var City = require('./../../models/City');
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
		var customerData = {};
		var newCustomer = null;
		if(req.body.name){
			customerData['name'] = req.body.name;
		}
		if(req.body.email){
			customerData['email'] = req.body.email;
		}
		if(customerData && (customerData["name"] || customerData["email"])){
			newCustomer = customer.update(customerData);
		}
		if(!customer.customer_detail){
			if(!req.body.addressOne || !req.body.addressTwo || !req.body.cityId || !req.body.stateId){
				return res.status(500).send({ message: "Address information is missing" });
			}
			var dataToCreate = {
				customer_id : customer.id,
				address_one : req.body.addressOne,
				address_two : req.body.addressTwo,
				city_id : req.body.cityId,
				state_id : req.body.stateId,
				lat : req.body.latitude,
				long : req.body.longitude
			};
			CustomerDetail.create(dataToCreate)
			.then(customerDetails => {
				this.fetchCustomerDetails(req, res);
			})
			.catch(err => {
				res.status(500).send({ message: err.message });
			});
		}
		else{
			var dataToUpdate = {};
			if(req.body.addressOne)
				dataToUpdate['address_one'] = req.body.addressOne;
			if(req.body.addressTwo)
				dataToUpdate['address_two'] = req.body.addressTwo;
			if(req.body.cityId)
				dataToUpdate['city_id'] = req.body.cityId;
			if(req.body.stateId)
				dataToUpdate['state_id'] = req.body.stateId;
			if(req.body.latitude)
				dataToUpdate['lat'] = req.body.latitude;
			if(req.body.longitude)
				dataToUpdate['long'] = req.body.longitude;
			customer.customer_detail.update(dataToUpdate)
			.then(customerDetails => {
				this.fetchCustomerDetails(req, res);
			})
			.catch(err => {
				res.status(500).send({ message: err.message });
			});
		}
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
};

exports.fetchCustomerDetails = (req, res) => {
	Customer.findOne({
		where: {
			id: req.customerId
		},
		include:[
			{ model: CustomerDetail, as: 'customer_detail', required: false,
				include: [
					{ model: City, as: 'city' },
					{ model: State, as: 'state' }
				]
			}
		]
	})
	.then(customer => {
		if (!customer) {
			return res.status(404).send({ message: "User not found." });
		}
		else{
			res.status(200).send({
				customer: customer
			});
		}
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
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