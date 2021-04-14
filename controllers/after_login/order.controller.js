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
	var restaurantInReq = data.restaurantInReq;
	var gstPercentage = !restaurantInReq.restaurant_website_detail.should_calculate_gst ? 0 : restaurantInReq.is_ecommerce ? constants.gstDefaultPercentage.eCommerce : constants.gstDefaultPercentage.restaurant;
	console.log(`Total price sent by client: ${data.totalPrice}`);
	console.log(`Restaurant in req: ${restaurantInReq}`);

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
				console.log(`GST Percentage to be added: ${gstPercentage}`);
				console.log(`Before adding GST : ${totalPriceFromDb}`);
				totalPriceFromDb = totalPriceFromDb + (totalPriceFromDb/100) * gstPercentage;
				console.log(`After adding GST : ${totalPriceFromDb}`);

				//TODO: Temporarily adding the default_delivery_charge calculation as well
				// we have to revisit this calcualtion once after we have done the proper delivery charge calculation
				var defaultDeliveryCharge = parseFloat(restaurantInReq.restaurant_website_detail.default_delivery_charge);
				totalPriceFromDb = totalPriceFromDb + (defaultDeliveryCharge > 0 ? defaultDeliveryCharge : 0);
				console.log(`After adding Default Delivery Charge of ${restaurantInReq.restaurant_website_detail.default_delivery_charge} : ${totalPriceFromDb}`);
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
					cb(foundMistake);
					return;
				}
				return foundMistake;
			}
			else{
				count++;
			}
		})
		.catch(err => {
			console.log("have reached the catch block of verifyDiscountedPrice function..");
			console.log(err);
			foundMistake = true;
			if(count == menus.length){
				if(cb){
					cb(foundMistake);
					return;
				}
				return foundMistake;
			}
			else{
				count++;
			}
		});
	});
}

exports.placeOrder = async (req, res) => {
	// Customer.findOne({
	// 	where: {
	// 		id: req.customerId
	// 	},
	// 	include:[
	// 		{ model: CustomerDetail, as: 'customer_detail', required: false }
	// 	]
	// })
	// .then(customer => {
		// if (!customer) {
		// 	return res.status(404).send({ message: "User not found." });
		// }
		// if(!customer.customer_detail || !customer.customer_detail.address_one || !customer.customer_detail.address_two){
		// 	return res.status(404).send({ message: "Delivery address not found." });
		// }
		if(!req.body.menus || !Array.isArray(req.body.menus) || !(req.body.menus.length > 0)){
			return res.status(404).send({ message: "Menu items not added" });
		}
		var menus = req.body.menus;
		var restaurantInRequest = await Restaurant.findOne({
			where: {
				id: req.restuarantBranch.restaurant_id
			},
			include:[
				{ model: RestaurantWebsiteDetail, as: 'restaurant_website_detail'}
			]
		});

		// In case if the restaurent id did not available
		if(!restaurantInRequest || restaurantInRequest === undefined){
			return res.status(404).send({ message: "Restaurant id mismatch." });
		}

		// In case, if the business prefers min_order_purchase to be done & the order value did not match it.
		var minPurchaseAmount = parseFloat(restaurantInRequest.restaurant_website_detail.min_purchase_amount);
		if(minPurchaseAmount > 0 && req.body.total_price < minPurchaseAmount){
			return res.status(404).send({ message: "Minimum order purchase amount does not match with total price sent." });
		}

		// RestaurantBranch.findOne({
		// 	where: {
		// 		id: req.body.restuarantBranchId
		// 	}
		// })
		// .then(restuarantBranch => {
		// 	if (!restuarantBranch) {
		// 		return res.status(404).send({ message: "Particular branch has not found." });
		// 	}
			// OrderStage.findOne({
			// 	where: {
			// 		name: 'Fresh'
			// 	}
			// })
			// .then(orderStage => {
			// 	if (!orderStage) {
			// 		return res.status(404).send({ message: "Order stage is not found." });
			// 	}
				// helper.getPaymentStatusId('notPaid', function(paymentStatusId){
				
					// ModeOfDelivery.findOne({
					// 	where: {
					// 		name: "Door Delivery"
					// 	}
					// })
					// .then(modeOfDelivery => {
					// 	if (!modeOfDelivery) {
					// 		return res.status(404).send({ message: "Mode of delivery is not found." });
					// 	}
						
						verifyDiscountedPrice({'menus': menus, 'totalPrice' : req.body.total_price, 'restaurantInReq': restaurantInRequest}, function(foundMistake){ //This is to verify whether the calculated discount value in the UI is correct or not
							if(!foundMistake){
								var orderData = {
									customer_id: req.customer.id,
									restuarant_branch_id: req.restuarantBranch.id,
									description: req.body.description,
									total_price: req.body.total_price,
									stage_id: req.orderStage.id,
									payment_status_id: req.paymentStatusId,
									mode_of_delivery_id: req.modeOfDelivery.id,
									delivery_address_one: req.customer.customer_detail.address_one,
									delivery_address_two: req.customer.customer_detail.address_two,
									lat: req.body.latitude,
									long: req.body.longitude,
									payment_type_id: req.body.paymentType
								};
								Order.create(orderData)
								.then(createdOrder => {
									if(req.body.date_of_delivery){
										var preBookData = {
											'order_id': createdOrder.id,
											'date_of_delivery': req.body.date_of_delivery, //Should be in the format of "YYYY-MM-DD"
											'time_of_delivery': req.body.time_of_delivery ? req.body.time_of_delivery : null //It is a text. delivery slot text Ex. 9.00 am - 10.00 am
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
											id: req.restuarantBranch.restaurant_id
										},
										include:[
											{ model: RestaurantPaymentGateway, as: 'restaurant_payments_gateways', required: false, where: { status: true } }
										]
									})
									.then(restaurantData => {
										req.orderId = createdOrder.id;
										req.amount = req.body.total_price;
										req.restaurantData = restaurantData;
										var statusPageDomain = restaurantData.url;
										var statusPageEndPoint = "/order/" + createdOrder.id + "/status";
										//Triggering msg to customer who placed the order

										// smsHelper.triggerTransactionalSms(
										// 	req.customer.mobile,
										// 	constants.countryDialCode.india,
										// 	"We have got your order request. We will get back to you soon. Till then, please check your order status here " + statusPageUrl,
										// 	null
										// );
										smsHelper.triggerTransactionalSms(
											req.customer.mobile,
											constants.countryDialCode.india,
											[statusPageDomain, statusPageEndPoint, restaurantData.name],
											'JUST_AFTER_ORDER_PLACED', //message template name
											null
										);

										smsHelper.triggerTransactionalSms(
											req.restuarantBranch.contact_number,
											constants.countryDialCode.india,
											[restaurantData.name],
											'RESTAURANT_NEW_ORDER_RECEIVED', //message template name
											null
										);
										//Triggering msg to the restaurant's particular branch's (to whom ethe order placed) contact number
										// smsHelper.triggerTransactionalSms(
										// 	req.restuarantBranch.contact_number,
										// 	constants.countryDialCode.india,
										// 	"Hello " + restaurantData.name + ", You have received one order now. Please sign in to www.smartdiner.co to process the order.",
										// 	null
										// );

										switch(parseInt(req.body.paymentType)){
											case constants.paymentType.cashOnDelivery:
												res.status(200).send({
													'orderId': createdOrder.id,
													'redirectPage' : 'orderStatus',
													'message' : 'Success'
												});
											break;
											case constants.paymentType.onlinePayment:
												PaymentsController.createRequest(req, res);
											break;
										}
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
					// })
					// .catch(err => {
					// 	res.status(500).send({ message: err.message });
					// });
				// });
			// })
			// .catch(err => {
			// 	res.status(500).send({ message: err.message });
			// });
			
		// })
		// .catch(err => {
		// 	res.status(500).send({ message: err.message });
		// });
	// })
	// .catch(err => {
	// 	res.status(500).send({ message: err.message });
	// });
};

exports.placeOfflineOrder = (req, res) => {
	req.isOfflineOrderCreation = true;
	var customerDetailData = {
		'city_id' : req.body.cityId,
		'state_id' : req.body.stateId,
		'address_one' : req.body.addressOne,
		'address_two' : req.body.addressTwo
	};
	Customer.findOne({
		where: {
			mobile: req.body.mobile.toString()
		},
		include: [
			{ model: CustomerDetail, as: 'customer_detail', required: false }
		]
	})
	.then(customerData => {
		if (!customerData) {
			Customer.create({ 'mobile' : req.body.mobile, 'role_id': constants.roles.customer }).then(addedCustomer => {
				customerDetailData.customer_id = addedCustomer.id
				CustomerDetail.create(customerDetailData)
				.then(customerDetail => {
					attachCustomerAndCreateOrder(req, res);
				})
				.catch(err => {
					res.status(500).send({ message: err.message });
				});
			})
			.catch(err => {
				res.status(500).send({ message: err.message });
			});
		}
		else{
			if(customerData.customer_detail){
				customerData.customer_detail.update(customerDetailData)
				.then(customerDetail => {
					attachCustomerAndCreateOrder(req, res);
				})
				.catch(err => {
					res.status(500).send({ message: err.message });
				});
			}
			else{
				customerDetailData.customer_id = customerData.id
				CustomerDetail.create(customerDetailData)
				.then(customerDetail => {
					attachCustomerAndCreateOrder(req, res);
				})
				.catch(err => {
					res.status(500).send({ message: err.message });
				});
			}
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
}

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

attachCustomerAndCreateOrder = (req, res) => {
	Customer.findOne({
		where: {
			mobile: req.body.mobile.toString()
		},
		include:[
			{ model: CustomerDetail, as: 'customer_detail', required: false }
		]
	})
	.then(customer => {
		req.customer = customer;
		this.placeOrder(req, res);
	})
	.catch(err => {
		console.log(err);
		res.status(500).send({ message: err.message });
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
					longitude: restuarant.restaurant_branches[0].long,
					gaTrackingId: restuarant.restaurant_website_detail.ga_tracking_id,
					isEcommerce: restuarant.is_ecommerce
				};
				Order.findOne({
					where: {
						id: req.params.id
					},
					order: [
						[
							{ model: Payment, as: 'payments', required: false }, 'created_at', 'DESC',
						]
					],
					include:[
						{ model: Cancellation, as: 'cancellation', required: false },
						{ model: Payment, as: 'payments', required: false }
					]
				})
				.then(order => {
					if(!order){
						dataToSend['message'] = 'Order not found';
						return res.status(200).send(dataToSend);
					}
					req.params.orderId = order.id;
					req.isFromGetOrderStatus = true;
					RestaurantController.getMenuQuantityMeasurePriceDetailsForOrder(req, res, function(menuDetails){
						if(menuDetails){
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
											//Check for automatic OTP trigger to the customer's phone number
											if(!customer.mobile_verification){
												//Trigger OTP to verify the mobile number
												smsHelper.triggerOtp(customer.mobile, constants.countryDialCode.india, function(smsStatus){
													if(smsStatus)
														console.log("Trigger automatic OTP successfully");
													else console.log("Triggering automatic OTP failed")
												});
											}
											var paymentLink = null;
											if(order.payments && order.payments.length > 0 && order.payment_status_id != constants.paymentStatuses["paid"]){
												paymentLink = order.payments[0].payment_url_long;
											}
											dataToSend["name"] = customer.name;
											dataToSend["customerContactNumber"] = customer.mobile;
											dataToSend["mobileVerification"] = customer.mobile_verification;
											dataToSend["stage_id"] = order.stage_id;
											dataToSend["totalAmount"] = order.total_price;
											dataToSend["deliveryAddressOne"] = order.delivery_address_one;
											dataToSend["deliveryAddressTwo"] = order.delivery_address_two;
											dataToSend["createdDate"] = order.createdAt;
											dataToSend["cancellationReason"] = order.cancellation ? order.cancellation.cancellation_reason : null;
											dataToSend["cancellationDateTime"] = order.cancellation ? order.cancellation.time_of_cancellation : null;
											dataToSend["paymentTypeId"] = order.payment_type_id;
											dataToSend["paymentStatusId"] = order.payment_status_id;
											dataToSend["paymentLink"] = paymentLink;
											dataToSend["orderDetailMenus"] = menuDetails;
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
						}
						else {
							dataToSend['message'] = 'Ordered Menu details not found';
							return res.status(200).send(dataToSend);
						}
					});
				})
				.catch(err => {
					console.log(err);
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

