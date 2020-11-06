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
var Menu = require('./../../models/Menu');
var MenuQuantityMeasurePrice = require('./../../models/MenuQuantityMeasurePrice');
var OrderDetailMenu = require('./../../models/OrderDetailMenu');
var PaymentsController = require('./payments.controller');
var RestaurantController = require('./restaurant.controller');
var helper = require('./../../helpers/general.helper');
var Cancellation = require("./../../models/Cancellation");
var OrderPreBookDetail = require('./../../models/OrderPreBookDetail');
var smsHelper = require('./../../helpers/sms.helper');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var RestaurantPaymentGateway = require('./../../models/RestaurantPaymentGateway');
var RestaurantWebsiteDetail = require('./../../models/RestaurantWebsiteDetail');
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

verifyDiscountedPrice= (data, cb) => {
	var foundMistake = false;
	var count = 1;
	var totalPriceFromDb = 0;
	var menus = data.menus;
	var totalPrice = parseFloat(data.totalPrice);
	menus.forEach((menu, index) => {
		Menu.findOne({
			where: {
				id: menu.id
			},
			include:[
				{
          			model: MenuQuantityMeasurePrice,
          			required:true,
          			as: 'menu_quantity_measure_price_list',
          			where: { status: true, id: menu.selectedMenuQuantityMeasurePriceId }
          		}
			]
		})
		.then(menuFromDb => {
			if(menuFromDb && menuFromDb.menu_quantity_measure_price_list && menuFromDb.menu_quantity_measure_price_list.length == 1){
				var discountFromDb = parseFloat(menuFromDb.discount);
				var quantity = parseFloat(menu.quantity)
				var originalPriceFromDb = parseFloat(menuFromDb.menu_quantity_measure_price_list[0].price);
				var discountedPriceFromDb = originalPriceFromDb - ((discountFromDb/100) * originalPriceFromDb);
				totalPriceFromDb += (discountedPriceFromDb * quantity);
				if(!(discountedPriceFromDb == parseFloat(menu.price) && originalPriceFromDb == parseFloat(menu.originalPrice)))
					foundMistake = true;
			}
			else{
				foundMistake = true;
			}
			if(count == menus.length){
				if(totalPriceFromDb !== totalPrice)
					foundMistake = true;
				if(cb){
					cb(!foundMistake);
					return;
				}
				return !foundMistake;
			}
			else{
				count++;
			}
		})
		.catch(err => {
			foundMistake = true;
			if(count == menus.length){
				if(cb){
					cb(!foundMistake);
					return;
				}
				return !foundMistake;
			}
			else{
				count++;
			}
		});
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
						verifyDiscountedPrice({'menus': menus, 'totalPrice' : req.body.total_price}, function(isCorrect){ //This is to verify whether the calculated discount value in the UI is correct or not
							if(isCorrect){
								Order.create(orderData)
								.then(createdOrder => {
									if(req.body.date_of_delivery){
										var preBookData = {
											'order_id': createdOrder.id,
											'date_of_delivery': req.body.date_of_delivery, //Should be in the format of "YYYY-MM-DD"
											'time_of_delivery': req.body.time_of_delivery ? req.body.time_of_delivery : null //Should be in the format of HH:MM. 24 hour clock
										};
										OrderPreBookDetail.create(preBookData)
										.then(orderPreBook => {
											console.log("Created orderPreBook successfully for teh order - " + createdOrder.id);
										})
										.catch(err => {
											console.log("Throwing create orderPreBook error");
											console.log(err);
											res.status(500).send({ message: err.message });
										});
									}
									menus.forEach(menu => {
										var orderDetailsData = {
											quantity: menu.quantity,
											price: menu.price, //Discounted price
											original_price: menu.originalPrice
										};
										var orderDetailMenuData = {
											order_id: createdOrder.id,
											menu_quantity_measure_price_id: menu.selectedMenuQuantityMeasurePriceId
										};
										addOrderDetails(orderDetailsData, orderDetailMenuData);
									});
									Restaurant.findOne({
										where: {
											id: restuarantBranch.restaurant_id
										},
										include:[
											{ model: RestaurantPaymentGateway, as: 'restaurant_payments_gateways', required: false, where: { status: true } }
										]
									})
									.then(restaurantData => {
										req.orderId = createdOrder.id;
										req.amount = req.body.total_price;
										req.customer = customer;
										req.restaurantData = restaurantData;
										PaymentsController.createRequest(req, res);

										//Triggering msg to customer who placed the order
										smsHelper.triggerTransactionalSms(
											customer.mobile,
											constants.countryDialCode.india,
											"We have got your order request. We will get back to you soon. Till then, please check your order status here " + restaurantData.url + "/order/" + createdOrder.id + "/status",
											null
										);

										//Triggering msg to the restaurant's particular branch's (to whom ethe order placed) contact number
										smsHelper.triggerTransactionalSms(
											restuarantBranch.contact_number,
											constants.countryDialCode.india,
											"Hello " + restaurantData.name + ", You have received one order now. Please sign in to www.smartdiner.co to process the order.",
											null
										);

										//Triggering sms to Sethu and Sharmi
										/*smsHelper.triggerTransactionalSms(
											'8838064610',
											constants.countryDialCode.india,
											"Hello " + restaurantData.name + ", You have received one order now. Please sign in to www.smartdiner.co to process the order.",
											null
										);
										smsHelper.triggerTransactionalSms(
											'7904465474',
											constants.countryDialCode.india,
											"Hello " + restaurantData.name + ", You have received one order now. Please sign in to www.smartdiner.co to process the order.",
											null
										);*/
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
							}
							else{
								return res.status(404).send({ message: "Calculated discounted value is wrong. Please contact the restaurant." });
							}
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
			include: [
				{ model: Payment, as: 'payments', required: false,
					include: [
        				{ model: RestaurantPaymentGateway, required: true, as: 'restaurant_payment_gateway' }
        			]
        		}
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
		var hostname = (new URL(req.headers.origin)).hostname;
		Restaurant.findOne({
			where: {
				status: true,
				url: {
					[Op.like]: '%' + hostname + '%'
				}
			},
			include:[
				{ model: RestaurantBranch, required:true, as: 'restaurant_branches' },
				{ model: RestaurantWebsiteDetail, as: 'restaurant_website_detail'}
			],
		})
		.then(restuarant => {
			if(restuarant){
				var dataToSend = {
					restuarantName: restuarant.name,
					restaurantContactNumber: restuarant.restaurant_branches[0].contact_number,
					restuarantEmailId: restuarant.restaurant_branches[0].email,
					restuarantAddress: restuarant.restaurant_branches[0].address,
					logo: restuarant.logo,
					is_delivery_available: restuarant.restaurant_website_detail.is_delivery_available,
					latitude: restuarant.restaurant_branches[0].lat,
					longitude: restuarant.restaurant_branches[0].long
				};
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
						dataToSend['message'] = 'Order not found';
						return res.status(200).send(dataToSend);
					}
					Customer.findByPk(order.customer_id)
					.then(customer => {
						if(!customer){
							dataToSend['message'] = 'Customer not found';
							return res.status(200).send(dataToSend);
						}
						RestaurantBranch.findByPk(order.restuarant_branch_id)
						.then(restuarantBranch => {
							if(!restuarantBranch){
								dataToSend['message'] = 'Restuarant branch is not found for the order';
								return res.status(200).send(dataToSend);
							}
							// Restaurant.findByPk(restuarantBranch.restaurant_id)
							// .then(restuarant => {
								// if(!restuarant){
								// 	res.status(404).send({ message : 'Restuarant branch is not found'});
								// }
								if(restuarant.id == restuarantBranch.restaurant_id){
									dataToSend["name"] = customer.name;
									dataToSend["stage_id"] = order.stage_id;
									dataToSend["totalAmount"] = order.total_price;
									dataToSend["deliveryAddressOne"] = order.delivery_address_one;
									dataToSend["deliveryAddressTwo"] = order.delivery_address_two;
									dataToSend["createdDate"] = order.createdAt;
									dataToSend["cancellationReason"] = order.cancellation ? order.cancellation.cancellation_reason : null;
									dataToSend["cancellationDateTime"] = order.cancellation ? order.cancellation.time_of_cancellation : null;
									return res.status(200).send(dataToSend);
								}
								else{
									dataToSend['message'] = 'Invalid Order';
									return res.status(200).send(dataToSend);
								}
							// })
							// .catch(err => {
							// 	res.status(500).send({ message : err});
							// });
						})
						.catch(err => {
							return res.status(500).send({ message : err});
						});
					})
					.catch(err => {
						return res.status(500).send({ message : err});
					});
					// if(req.params.payment_id && req.params.payment_request_id && payment_status)
				})
				.catch(err => {
					return res.status(500).send({ message : err});
				});
			}
			else{
				return res.status(404).send({ message : 'Illegal request'});
			}
		})
		.catch(err1 => {
			console.log(err1);
			return res.status(500).send({ message: err1.message });
		});
	}
	else{
		return res.status(404).send({ message : 'Illegal request'});
	}
};
