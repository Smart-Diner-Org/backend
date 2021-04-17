const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var constants = require('./../../config/constants');
var DeliveryPersonPartnerAssociation = require('./../../models/DeliveryPersonPartnerAssociation');
var DeliveryRequest = require('./../../models/DeliveryRequest');
var Order = require('./../../models/Order');
var Customer = require('./../../models/Customer');
var RestaurantBranch = require('./../../models/RestaurantBranch');
var Restaurant = require('./../../models/Restaurant');
var DeliveryStage = require('./../../models/DeliveryStage');
var smsHelper = require('./../../helpers/sms.helper');

getDeliveryPartnerId = (preferredId_1, preferredId_2 = null) => {
	var deliveryPartnerId = null;
	switch(parseInt(preferredId_1)){
		case constants.deliveryPreferences.inHouse:
			deliveryPartnerId = constants.deliveryPartners.inHouseDelivery;
			break;
		case constants.deliveryPreferences.service:
			deliveryPartnerId = constants.deliveryPartners.kovaiDeliveryBoys;
			break;
		case constants.deliveryPreferences.all:
			if(preferredId_2)
				deliveryPartnerId = getDeliveryPartnerId(preferredId_2);
			break;
	}
	return deliveryPartnerId;
}

exports.assignDeliveryPartnerForOrder = (req, res) => {
	if(!req.customerId)
		res.status(404).send({ message: "Not a valid user. Please check." });
	if(!req.params.orderId){
		res.status(404).send({ message: "Order id is missing. Please check." });
	}
	Order.findOne({
		where: {
			id: req.params.orderId
		},
		include:[
			{ model: RestaurantBranch, required: true, as: 'restuarant_branch' }
		]
	})
	.then(order => {
		if(!order){
			res.status(404).send({ message: "Order does not exist." });
		}
		var deliveryPartnerId = null;
		deliveryPartnerId = getDeliveryPartnerId(order.restuarant_branch.delivery_partner_preference_id, req.body.preferredDelivery);
		if(deliveryPartnerId){
			DeliveryPersonPartnerAssociation.findOne({
				attributes: ['delivery_person_id'],
				where: {
					delivery_partner_id: deliveryPartnerId,
					status: true
				},
				order: [
					['id', 'ASC'],
					['created_at', 'ASC'],
				]
			})
			.then(deliveryPersonId => {
				if(deliveryPersonId){
					var deliveryRequestDataToSave = {
						order_id : req.params.orderId,
						delivery_person_id : deliveryPersonId.delivery_person_id,
						delivery_stage_id : constants.deliveryStages.requested,
						notes : (req.body.notes ? req.body.notes : null)
					};
					DeliveryRequest.create(deliveryRequestDataToSave)
					.then(savedDeliveryRequest => {
						Customer.findOne({
							where: {
								id: deliveryPersonId.delivery_person_id
							}
						})
						.then(deliveryPersonDetail => {
							if(deliveryPersonDetail){
								smsHelper.triggerTransactionalSms(
									deliveryPersonDetail.mobile,
									constants.countryDialCode.india,
									[deliveryPersonDetail.name],
									'NEW_DELIVERY_REQUEST_RECEIVED', //message template name
									null
								);
								return res.status(200).send(savedDeliveryRequest);
							}
							else res.status(404).send({ message: "Could not find delievry person in the database. Something happened" });
						})
						.catch(err => {
							console.log(err);
							res.status(500).send({ message: err.message });
						});
					})
					.catch(err => {
						console.log(err);
						res.status(500).send({ message: err.message });
					});
				}
				else res.status(404).send({ message: "Could not find delievry person id. Some parameter is not correct / missing" });
			})
			.catch(err => {
				console.log(err);
				res.status(500).send({ message: err.message });
			});
		}
		else res.status(404).send({ message: "Could not find delievry partner id. Some parameter is not correct / missing" });
	})
	.catch(err => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
}

exports.acceptDelivery = (req, res) => {
	if(!req.params.deliveryRequestId){
		res.status(404).send({ message: "Delivery request id is missing. Please check." });
	}
	DeliveryRequest.findOne({
		where: {
			id: req.params.deliveryRequestId
		}
	})
	.then(deliveryRequest => {
		if(deliveryRequest){
			deliveryRequest.update({
				delivery_stage_id : constants.deliveryStages.accepted
			})
			.then(updatedDeliveryRequest => {
				return res.status(200).send(updatedDeliveryRequest);
			})
			.catch(err => {
				console.log("Update Delivery Request failed");
				console.log(err);
				res.status(500).send({ message: err })
			});
		}
		else res.status(404).send({ message: "Could not find Delivery request. Please check." });
	})
	.catch(err => {
		console.log("Fetch Delivery Request failed");
		console.log(err);
		res.status(500).send({ message: err })
	});
}

exports.updateDeliveryRequestStage = (req, res) => {
	if(!req.params.deliveryRequestId){
		res.status(404).send({ message: "Delivery request id is missing. Please check." });
	}
	if(!req.body.deliveryRequestStageId){
		res.status(404).send({ message: "Delivery request stage id is missing. Please check." });
	}
	DeliveryRequest.findOne({
		where: {
			id: req.params.deliveryRequestId
		}
	})
	.then(deliveryRequest => {
		if(deliveryRequest){
			DeliveryStage.findOne({
				where: {
					id: req.body.deliveryRequestStageId
				}
			})
			.then(deliveryStage => {
				if(deliveryStage){
					deliveryRequest.update({
						delivery_stage_id : req.body.deliveryRequestStageId
					})
					.then(updatedDeliveryRequest => {
						return res.status(200).send(updatedDeliveryRequest);
					})
					.catch(err => {
						console.log("Update Delivery Request failed");
						console.log(err);
						res.status(500).send({ message: err })
					});
				}
				else res.status(404).send({ message: "Could not find the given delivery stage. Please check." });
			})
			.catch(err => {
				console.log("Update Delivery Request failed");
				console.log(err);
				res.status(500).send({ message: err })
			});
		}
		else res.status(404).send({ message: "Could not find Delivery request. Please check." });
	})
	.catch(err => {
		console.log("Fetch Delivery Request failed");
		console.log(err);
		res.status(500).send({ message: err })
	});
}

exports.getAllRequestsOfDeliveryPartner = (req, res) => {
	if(!req.customerId)
		res.status(404).send({ message: "Not a valid user. Please check." });
	DeliveryPersonPartnerAssociation.findOne({
		where: {
			delivery_person_id: req.customerId
		},
		attributes: ['delivery_partner_id']
	})
	.then(associatedDeliveryPartner => {
		if(associatedDeliveryPartner){
			DeliveryPersonPartnerAssociation.findAll({
				where: {
					delivery_partner_id: associatedDeliveryPartner.delivery_partner_id
				},
				// attributes: {
				// 	include: [[Sequelize.literal('delivery_person.id'), 'delivery_person_value']],
				// },
				// include: [{ model: Customer, as: 'delivery_person', attributes: ['id', 'name'] }]
				attributes: ['delivery_person_id']
			})
			.then(deliveryPersons => {
				if(deliveryPersons){
					var deliveryPersonsArray = deliveryPersons.map((event) => event.delivery_person_id);
					DeliveryRequest.findAll({
						where: {delivery_person_id: deliveryPersonsArray},
						attributes: ['order_id']
					})
					.then(deliveryRequestsOrders => {
						if(deliveryRequestsOrders){
							var deliveryRequestsOrdersArray = deliveryRequestsOrders.map((event) => event.order_id);
							Order.findAll({
								where: {id: deliveryRequestsOrdersArray},
								order: [
									[
										{ model: DeliveryRequest, as: 'delivery_requests', required: true }, 'created_at', 'DESC',
									]
								],
								include:[
									{ model: DeliveryRequest, required: true, as: 'delivery_requests',
										include:[
											{ model: Customer, required: true, as: 'delivery_person' }
										]
									},
									{ model: RestaurantBranch, required: true, as: 'restuarant_branch',
										include:[
											{ model: Restaurant, required: true, as: 'restaurant' }
										]
									},
									{ model: Customer, required: true, as: 'customer' }
								]
							})
							.then(ordersWithOtherDetails => {
								if(ordersWithOtherDetails){
									return res.status(200).send(ordersWithOtherDetails);
								}
								else res.status(404).send({ message: "Could not find orders & other details of the orders for the delivery partner" });
							})
							.catch(err => {
								console.log("Fetching all the orders of the partner failed");
								console.log(err);
								res.status(500).send({ message: err })
							});
						}
						else res.status(404).send({ message: "Could not find orders for the delivery partner" });
					})
					.catch(err => {
						console.log("Fetching all Delivery persons of the partner failed");
						console.log(err);
						res.status(500).send({ message: err })
					});
				}
				else res.status(404).send({ message: "Could not find all the delivery persons id for the delivery partner" });
			})
			.catch(err => {
				console.log("Fetching all Delivery persons of the partner failed");
				console.log(err);
				res.status(500).send({ message: err })
			});
		}
		else{
			res.status(404).send({ message: "Could not find the associated delivery partner id" });
		}
	})
	.catch(err => {
		console.log("Fetching 'delivery_partner_id' from Delivery partner association is failed");
		console.log(err);
		res.status(500).send({ message: err })
	});
}

