const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var constants = require('./../../config/constants');
var DeliveryPersonPartnerAssociation = require('./../../models/DeliveryPersonPartnerAssociation');
var DeliveryRequest = require('./../../models/DeliveryRequest');
var Order = require('./../../models/Order');
var RestaurantBranch = require('./../../models/RestaurantBranch');

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
						return res.status(200).send(savedDeliveryRequest);
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

