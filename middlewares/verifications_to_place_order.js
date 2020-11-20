// const Role = require("../models/Role");
const Customer = require("../models/Customer");
const CustomerDetail = require("../models/CustomerDetail");
const RestaurantBranch = require("../models/RestaurantBranch");
var OrderStage = require('./../models/OrderStage');
var PaymentStatus = require('./../models/PaymentStatus');
var PaymentType = require('./../models/PaymentType');
var ModeOfDelivery = require('./../models/ModeOfDelivery');
var helper = require('./../helpers/general.helper');

exports.checkMobileNumber = (req, res, next) => {
	if(!req.body.mobile)
		return res.status(404).send({ message: "Mobile number not found." });
	next();
}

exports.checkCustomerAddress = (req, res, next) => {
	if(!req.body.addressOne || !req.body.addressTwo || !req.body.cityId || !req.body.stateId)
		return res.status(404).send({ message: "Address is not found." });
	next();
}

exports.checkCustomer = (req, res, next) => {
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
		if(!customer.customer_detail || !customer.customer_detail.address_one || !customer.customer_detail.address_two){
			return res.status(404).send({ message: "Delivery address not found." });
		}
		req.customer = customer;
		next();
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
}

exports.checkRestaurantBranch = (req, res, next) => {
	RestaurantBranch.findOne({
		where: {
			id: req.body.restuarantBranchId
		}
	})
	.then(restuarantBranch => {
		if (!restuarantBranch) {
			return res.status(404).send({ message: "Particular branch has not found." });
		}
		req.restuarantBranch = restuarantBranch;
		next();
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
}

exports.checkOrderStage = (req, res, next) => {
	OrderStage.findOne({
		where: {
			name: 'Fresh'
		}
	})
	.then(orderStage => {
		if (!orderStage) {
			return res.status(404).send({ message: "Order stage is not found." });
		}
		req.orderStage = orderStage;
		next();
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
}

exports.checkPaymentStatus = (req, res, next) => {
	if(req.body.paymentStatus){
		PaymentStatus.findOne({
			where: {
				id: req.body.paymentStatus
			}
		})
		.then(paymentStatus => {
			if (!paymentStatus) {
				return res.status(404).send({ message: "Payment status is not found." });
			}
			req.paymentStatusId = paymentStatus.id;
			next();
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
	}
	else{
		helper.getPaymentStatusId('notPaid', function(paymentStatusId){
			req.paymentStatusId = paymentStatusId;
			next();
		});
	}
}

exports.checkModeOfDelivery = (req, res, next) => {
	if(req.body.deliveryMode){
		ModeOfDelivery.findOne({
			where: {
				id: req.body.deliveryMode
			}
		})
		.then(modeOfDelivery => {
			if (!modeOfDelivery) {
				return res.status(404).send({ message: "Mode of delivery is not found." });
			}
			req.modeOfDelivery = modeOfDelivery;
			next();
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
	}
	else{
		ModeOfDelivery.findOne({
			where: {
				name: "Door Delivery"
			}
		})
		.then(modeOfDelivery => {
			if (!modeOfDelivery) {
				return res.status(404).send({ message: "Mode of delivery is not found." });
			}
			req.modeOfDelivery = modeOfDelivery;
			next();
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
	}
}

exports.checkPaymentType = (req, res, next) => {
	if(!req.body.paymentType)
		req.body.paymentType = 1;
		// return res.status(404).send({ message: "Payment type is not found." });
	PaymentType.findOne({
		where: {
			id: req.body.paymentType
		},
	})
	.then(payment_type => {
		if (!payment_type) {
			return res.status(404).send({ message: "Invalid Payment Type" });
		}
		// req.paymentType = paymentType;
		next();
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
}





