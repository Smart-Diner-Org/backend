var Customer = require('./../../models/Customer');
var Order = require('./../../models/Order');
var OrderStage = require('./../../models/OrderStage');
var PaymentStatus = require('./../../models/PaymentStatus');
var ModeOfDelivery = require('./../../models/ModeOfDelivery');
var constants = require('./../../config/constants');
var CustomerDetail = require('./../../models/CustomerDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
var OrderDetail = require('./../../models/OrderDetail');
var OrderDetailMenu = require('./../../models/OrderDetailMenu');
// const Sequelize = require('sequelize');
// const Op = Sequelize.Op;
// var _ = require('underscore');


exports.placeOrder = (req, res) => {
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
		if(!customer.customer_detail || !customer.customer_detail.address){
			return res.status(404).send({ message: "Delivery address not found." });
		}
		if(!req.body.menus || !Array.isArray(req.body.menus) || req.body.menus.length > 0){
			return res.status(404).send({ message: "Items not added" });
		}
		var menus = req.body.menus;
		RestaurantBranch.findOne({
			where: {
				id: req.body.restuarantBranchId
			}
		})
		.then(restuarantBranch => {
			if (!restuarantBranch) {
				return res.status(404).send({ message: "Particular branch has not found." });
			}
			OrderStage.findOne({
				where: {
					name: 'Fresh'
				}
			})
			.then(orderStage => {
				if (!orderStage) {
					return res.status(404).send({ message: "Order is not found." });
				}
				PaymentStatus.findOne({
					where: {
						name: "Not Paid"
					}
				})
				.then(paymentStatus => {
					if (!paymentStatus) {
						return res.status(404).send({ message: "Payment Status is not found." });
					}
					ModeOfDelivery.findOne({
						where: {
							name: "Door Delivery"
						}
					})
					.then(modeOfDelivery => {
						if (!modeOfDelivery) {
							return res.status(404).send({ message: "Payment Status is not found." });
						}
						var orderData = {
							customer_id: customer.id,
							restuarant_branch_id: restuarantBranch.id,
							description: req.body.description,
							total_price: req.body.total_price,
							stage_id: orderStage.id,
							payment_status_id: paymentStatus.id,
							mode_of_delivery_id: modeOfDelivery.id,
							delivery_address: customer.customer_detail.address,
							lat: req.body.latitude,
							long: req.body.longitude
						};
						var createdOrder = Order.create(orderData);
						// console.log("createdOrder...");
						// console.log(createdOrder);
						menus.forEach(menu => {
							console.log(menu);
							var orderDetails = {
								order_id: createdOrder.id,
								menu_id: menu.id,
								quantity: menu.quantity,
								price: menu.price,
								price_original: menu.originalPrice
							};

						});
					})
					.catch(err => {
						res.status(500).send({ message: err.message });
					});
				})
				.catch(err => {
					res.status(500).send({ message: err.message });
				});

			})
			.catch(err => {
				res.status(500).send({ message: err.message });
			});
			
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
};