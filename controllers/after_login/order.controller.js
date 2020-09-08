var Customer = require('./../../models/Customer');
var Order = require('./../../models/Order');
var OrderStage = require('./../../models/OrderStage');
var Payment = require('./../../models/Payment');
var PaymentStatus = require('./../../models/PaymentStatus');
var ModeOfDelivery = require('./../../models/ModeOfDelivery');
var constants = require('./../../config/constants');
var CustomerDetail = require('./../../models/CustomerDetail');
var RestaurantBranch = require('./../../models/RestaurantBranch');
var Restaurant = require('./../../models/Restaurant');
var OrderDetail = require('./../../models/OrderDetail');
var Order = require('./../../models/Order');
var OrderDetailMenu = require('./../../models/OrderDetailMenu');
var PaymentsController = require('./payments.controller');
var RestaurantController = require('./restaurant.controller');
var helper = require('./../../helpers/general.helper');
var Cancellation = require("./../../models/Cancellation");
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
		if(!customer.customer_detail || !customer.customer_detail.address_one || !customer.customer_detail.address_two){
			return res.status(404).send({ message: "Delivery address not found." });
		}
		if(!req.body.menus || !Array.isArray(req.body.menus) || !(req.body.menus.length > 0)){
			return res.status(404).send({ message: "Menu items not added" });
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
					return res.status(404).send({ message: "Order stage is not found." });
				}
				helper.getPaymentStatusId('notPaid', function(paymentStatusId){
				
					ModeOfDelivery.findOne({
						where: {
							name: "Door Delivery"
						}
					})
					.then(modeOfDelivery => {
						if (!modeOfDelivery) {
							return res.status(404).send({ message: "Mode of delivery is not found." });
						}
						var orderData = {
							customer_id: customer.id,
							restuarant_branch_id: restuarantBranch.id,
							description: req.body.description,
							total_price: req.body.total_price,
							stage_id: orderStage.id,
							payment_status_id: paymentStatusId,
							mode_of_delivery_id: modeOfDelivery.id,
							delivery_address_one: customer.customer_detail.address_one,
							delivery_address_two: customer.customer_detail.address_two,
							lat: req.body.latitude,
							long: req.body.longitude
						};
						Order.create(orderData)
						.then(createdOrder => {
							menus.forEach(menu => {
								var orderDetailsData = {
									quantity: menu.quantity,
									price: menu.price, //Discounted price
									original_price: menu.originalPrice
								};
								var orderDetailMenuData = {
									order_id: createdOrder.id,
									menu_id : menu.id
								};
								addOrderDetails(orderDetailsData, orderDetailMenuData);
							});
							console.log("checking restaurant");
							console.log(restuarantBranch.restaurant_id);
							Restaurant.findByPk(restuarantBranch.restaurant_id)
							.then(restaurantData => {
								console.log(restaurantData);
								
								req.orderId = createdOrder.id;
								req.amount = req.body.total_price;
								req.customer = customer;
								req.restaurantData = restaurantData;
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

exports.updateOrderStage = (req, res) => {
	if(!req.params.orderId || !req.customerId || !req.body.stageId){
		res.status(404).send({ message: "Order id or Stage Id or log in information missing. Please check." });
	}

	Customer.findByPk(req.customerId)
	.then(customer => {
		if (!customer) {
			return res.status(404).send({ message: "User not found." });
		}
		Order.findOne({
			where: {
				id: req.params.orderId
			},
			include:[
				{ model: Payment, as: 'payments', required: false }
			]
		})
		.then(order => {
			if(!order){
				res.status(404).send({ message: "Order does not exist." });
			}
			order.update({ stage_id: req.body.stageId })
			.then(order => {
				req.params.branchId = order.restuarant_branch_id;
				RestaurantController.getOrdersForBranch(req, res);
			})
			.catch(err => {
				console.log("Update order failed");
				console.log(err);
				res.status(500).send({ message: err })
			});
		})
		.catch(err => {
			console.log("Fetch order failed");
			console.log(err);
			res.status(500).send({ message: err })
		});
	})
	.catch(err => {
		console.log("Fetch customer failed");
		console.log(err);
		res.status(500).send({ message: err })
	});
}

exports.cancelOrder = (req, res) => {
	var orderUpdateSuccess = false;
	var orderUpdateError = 'Error during updateing order status';
	var cancellationSuccess = false;
	var cancellationError = 'Error during cancellation';

	if(!req.params.orderId || !req.body.cancellationReason || !req.customerId){
		res.status(404).send({ message: "Order id or cancellation reason or log in information missing. Please check." });
	}

	Customer.findByPk(req.customerId)
	.then(customer => {
		if (!customer) {
			return res.status(404).send({ message: "User not found." });
		}
		Order.findOne({
			where: {
				id: req.params.orderId
			},
			include:[
				{ model: Payment, as: 'payments', required: false }
			]
		})
		.then(order => {
			if(!order){
				res.status(404).send({ message: "Order does not exist." });
			}
			helper.getOrderStatusId('cancelled', function(orderStatusId){
				if(orderStatusId){
					if(order.stage_id != orderStatusId){
						order.update({ stage_id: orderStatusId });
						orderUpdateSuccess = true;
						var cancellationData = {
							order_id: order.id,
							cancellation_reason: req.body.cancellationReason,
							time_of_cancellation: helper.getCurrentDate(),
							customer_id: customer.id //Who did cancellation
						};
						Cancellation.create(cancellationData)
						.then(cancellationObject => {
							cancellationSuccess = true;
							if(order.payments && order.payments.length > 0){
								order.payments.forEach(payment => {
									if(payment.payment_id && payment.payment_status == constants.instamojo.paymentStatus.credit){
										PaymentsController.createRefund(null, null, {payment: payment, refundType: 'full', refundReason: req.body.cancellationReason}, function(refundCreationSuccess, refundCreationError){
											if(!refundCreationSuccess)
												return res.status(404).send({ message: refundCreationError });
											else if(!cancellationSuccess)
												return res.status(404).send({ message: cancellationError });
											else if(!orderUpdateSuccess)
												return res.status(404).send({ message: orderUpdateError });
											else{
												console.log('Order cancelled successfully and refund initiated');
												// res.status(200).send({ message: 'Order cancelled successfully and refund initiated' });
												req.params.branchId = order.restuarant_branch_id;
												RestaurantController.getOrdersForBranch(req, res);
											}
										});
									}
									else{
										if(!cancellationSuccess)
											return res.status(404).send({ message: cancellationError });
										else if(!orderUpdateSuccess)
											return res.status(404).send({ message: orderUpdateError });
										else{
											console.log('Order cancelled successfully. No success payment found.');
											// res.status(200).send({ message: 'Order cancelled successfully. No succes payment found.' });
											req.params.branchId = order.restuarant_branch_id;
											RestaurantController.getOrdersForBranch(req, res);
										}
									}
								});
							}
							else{
								if(!orderUpdateSuccess)
									return res.status(404).send({ message: orderUpdateError });
								else if(!cancellationSuccess)
									return res.status(404).send({ message: cancellationError });
								else{
									console.log('Order cancelled successfully. no payment found');
									// res.status(200).send({ message: 'Order cancelled successfully. no payment found' });
									req.params.branchId = order.restuarant_branch_id;
									RestaurantController.getOrdersForBranch(req, res);
								}
							}
						})
						.catch(err => {
							console.log("create cancellation failed");
							console.log(err);
							cancellationError = err;
							res.status(500).send({ message: err })
						});
					}
					else{
						console.log("Could not cancel this order because the order has got cancelled already - " + req.params.orderId);
						orderUpdateError = "Could not cancel this order because the order has got cancelled already";
						return res.status(404).send({ message: orderUpdateError });
					}
				}
				else{
					console.log("order status id not found for the order - " + req.params.orderId);
					orderUpdateError = "order status id not found for the order - " + req.params.orderId;
					return res.status(404).send({ message: orderUpdateError });
				}
			});
		})
		.catch(err => {
			console.log("Fetch order failed");
			console.log(err);
			res.status(500).send({ message: err })
		});
	})
	.catch(err => {
		console.log("Fetch customer failed");
		console.log(err);
		res.status(500).send({ message: err })
	});
};

exports.getOrderStatus = (req, res) => {
	if(req.params.id){
		// Order.findByPk(req.params.id)
		Order.findOne({
			where: {
				id: req.params.id
			},
			include:[
				{ model: Cancellation, as: 'cancellation', required: false }
			]
		})

		.then(order => {
			if(!order){
				res.status(404).send({ message : 'Order not found'});
			}
			Customer.findByPk(order.customer_id)
			.then(customer => {
				if(!customer){
					res.status(404).send({ message : 'Customer not found'});
				}
				RestaurantBranch.findByPk(order.restuarant_branch_id)
				.then(restuarantBranch => {
					if(!restuarantBranch){
						res.status(404).send({ message : 'Restuarant branch is not found'});
					}
					Restaurant.findByPk(restuarantBranch.restaurant_id)
					.then(restuarant => {
						if(!restuarant){
							res.status(404).send({ message : 'Restuarant branch is not found'});
						}
						res.status(200).send({
							name: customer.name,
							stage_id: order.stage_id,
							totalAmount: order.total_price,
							deliveryAddressOne: order.delivery_address_one,
							deliveryAddressTwo: order.delivery_address_two,
							restuarantName: restuarant.name,
							restaurantContactNumber: restuarantBranch.contact_number,
							restuarantEmailId: restuarantBranch.email,
							restuarantAddress: restuarantBranch.address,
							createdDate: order.createdAt,
							cancellationReason: order.cancellation ? order.cancellation.cancellation_reason : null,
							cancellationDateTime: order.cancellation ? order.cancellation.time_of_cancellation : null
						});
					})
					.catch(err => {
						res.status(500).send({ message : err});
					});
				})
				.catch(err => {
					res.status(500).send({ message : err});
				});
			})
			.catch(err => {
				res.status(500).send({ message : err});
			});
			// if(req.params.payment_id && req.params.payment_request_id && payment_status)
		})
		.catch(err => {
			res.status(500).send({ message : err});
		});
	}
	else res.status(404).send({ message : 'Illegal request'});
};
