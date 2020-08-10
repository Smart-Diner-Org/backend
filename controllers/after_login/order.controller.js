var Customer = require('./../../models/Customer');
var Order = require('./../../models/Order');
var OrderStage = require('./../../models/OrderStage');
var PaymentStatus = require('./../../models/PaymentStatus');
var ModeOfDelivery = require('./../../models/ModeOfDelivery');
var constants = require('./../../config/constants');
var CustomerDetail = require('./../../models/CustomerDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
var Restaurant = require('./../../models/Restaurant');
var OrderDetail = require('./../../models/OrderDetail');
var OrderDetailMenu = require('./../../models/OrderDetailMenu');
var PaymentsController = require('./payments.controller');
var helper = require('./../../helpers/general.helper');
// const Sequelize = require('sequelize');
// const Op = Sequelize.Op;
// var _ = require('underscore');

addOrderDetails = (orderDetailsData, orderDetailMenuData) => {
	OrderDetail.create(orderDetailsData)
	.then(orderDetail => {
		orderDetailMenuData['order_detail_id'] = orderDetail.id;
		OrderDetailMenu.create(orderDetailMenuData)
		.then(orderDetailMenu => {})
		.catch(err => {
			console.log("Got error while adding OrderDetailMenu.");
			console.log(err.message);
		});
	})
	.catch(err => {
		console.log("Got error while adding OrderDetail.");
		console.log(err.message);
	});
}

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
		if(!req.body.menus || !Array.isArray(req.body.menus) || !(req.body.menus.length > 0)){
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
				PaymentStatus.findAll({
					attributes: ['name', 'id']
				})
				// PaymentStatus.findOne({
				// 	where: {
				// 		name: "Not Paid"
				// 	}
				// })
				.then(paymentStatuses => {
					if (!paymentStatuses) {
						return res.status(404).send({ message: "Payment Status is not found." });
					}
					var paymentStatusId = helper.getPaymentStatusId(paymentStatuses, 'notPaid');
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
							payment_status_id: paymentStatusId,
							mode_of_delivery_id: modeOfDelivery.id,
							delivery_address: customer.customer_detail.address,
							lat: req.body.latitude,
							long: req.body.longitude
						};
						Order.create(orderData)
						.then(createdOrder => {
							// console.log("createdOrder...");
							// console.log(createdOrder);
							menus.forEach(menu => {
								// console.log(menu);
								var orderDetailsData = {
									order_id: createdOrder.id,
									// menu_id: menu.id,
									quantity: menu.quantity,
									price: menu.price, //Discounted price
									original_price: menu.originalPrice
								};
								var orderDetailMenuData = {
									menu_id : menu.id
								};
								addOrderDetails(orderDetailsData, orderDetailMenuData);
								// var orderDetail = OrderDetail.create(orderDetailsData);
								// console.log("orderDetail...");
								// console.log(orderDetail);
								// var orderDetailMenuData = {
								// 	order_detail_id : orderDetail.id,
								// 	menu_id : menu.id
								// };
								// var orderDetailMenu = OrderDetailMenu.create(orderDetailMenuData);
							});
							console.log("checking restaurant");
							console.log(restuarantBranch.restaurant_id);
							Restaurant.findByPk(restuarantBranch.restaurant_id)
							.then(restaurantData => {
								console.log(restaurantData);
								
								req.orderId = createdOrder.id;
								// req.orderObject = createdOrder;
								req.amount = req.body.total_price;
								req.customer = customer;
								req.restaurantData = restaurantData;
								req.paymentStatuses = paymentStatuses;
								console.log("gonna call payment");
								PaymentsController.createRequest(req, res);
							})
							.catch(err => {
								console.log("Throwing restaurant fetch error");
								console.log(err);
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
			
		})
		.catch(err => {
			res.status(500).send({ message: err.message });
		});
	})
	.catch(err => {
		res.status(500).send({ message: err.message });
	});
};