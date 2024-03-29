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
var DeliveryRequest = require('./../../models/DeliveryRequest')
var QuantityValue = require('./../../models/QuantityValue');
var MeasureValue = require('./../../models/MeasureValue');
var date = require('date-and-time');
var numWords = require('num-words')
var PushNotificationController = require('./push_notification.controller');
// var _ = require('underscore');
var menus;

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

getGstPercentage = (restaurantData) =>{
	var gstPercentage = !restaurantData.restaurant_website_detail.should_calculate_gst ? 0 : restaurantData.is_ecommerce ? constants.gstDefaultPercentage.eCommerce : constants.gstDefaultPercentage.restaurant;
	return gstPercentage;
}

convertToDecimal = (value) => {
	var num = parseFloat(value);
    if (isNaN(num)) {
        return 0;
    }

	if (String(num).split(".").length < 2 || String(num).split(".")[1].length<2 ){
        num = parseFloat(num).toFixed(2);
    }
    else num = parseFloat(num).toFixed(2);
    return num;
}

calculateDeliveryCharge = (restaurantInReq, deliveryDistance, totalMRP) => {
	var deliveryCharges = JSON.parse(restaurantInReq.restaurant_website_detail.delivery_charges);

	var deliveryCharge = 0;
	var distance = deliveryDistance;

	if(deliveryCharges && deliveryCharges.length > 0){
		deliveryCharges.forEach((data, index) => {
			if(data["order"] == 0 && data["excempt_limit"] && data["excempt_limit"] >= totalMRP){
				return true;
			}
			else if(distance >= 0.5 || restaurantInReq.is_ecommerce){

				// if(data["distance"] !== 'any'){
				// 	var tempDistance = parseFloat(data["distance"]);
					switch(data["price_type"]){
						case "fixed":
							deliveryCharge = deliveryCharge + data["price"];
							if(data["distance"] !== 'any')
								distance = distance - parseFloat(data["distance"]);
							else distance = 0;
							break;
						case "variable":
							if(data["distance"] !== 'any'){
								var tempDistance = parseFloat(data["distance"]);
								for(var i=0; i<tempDistance; i++){
									if(distance >= 0.5){
										deliveryCharge = deliveryCharge + data["price"];
										distance = distance - 1;
									}
								}
							}
							else{
								deliveryCharge = deliveryCharge + parseFloat((parseFloat(distance.toFixed(0)) * data["price"]));
							}
							break;
					}
				// }
				// else{
				// 	switch(data["price_type"]){
				// 		case "fixed":
				// 		deliveryCharge = deliveryCharge + data["price"];
				// 		distance = 0;
				// 		break;
				// 		case "variable":

				// 		break;
				// }
				
			}
		});
	}
	return deliveryCharge;
}

calculateDiscountOnMrp = (restaurantInReq, totalMRP) => {
	var discountOnMrpData = JSON.parse(restaurantInReq.restaurant_branches[0].discount_on_mrp);
	var discountOnMrp = 0;
	var selectedMinMrp = 0;
	totalMRP = parseFloat(totalMRP);
	if(discountOnMrpData && discountOnMrpData.length > 0){
		discountOnMrpData.forEach((data, index) => {
			var key = Object.keys(data);
			var minMrpLimit = parseInt(key[0]);
			if(totalMRP >= minMrpLimit && selectedMinMrp <= minMrpLimit){
				discountOnMrp = data[key[0]];
				selectedMinMrp = minMrpLimit;
			}
		})
	}
	return discountOnMrp;
}

verifyDiscountedPrice= (data, cb) => {
	var foundMistake = false;
	var count = 1;
	var totalPriceFromDb = 0;
	// menus = data.menus;
	var totalPrice = convertToDecimal(data.totalPrice);
	var totalMrpPrice = convertToDecimal(data.totalMrpPrice);
	var restaurantInReq = data.restaurantInReq;
	var gstPercentage = getGstPercentage(restaurantInReq);
	var deliveryDistance = parseFloat(data.deliveryDistance);
	// console.log(`Total price sent by client: ${data.totalPrice}`);
	// console.log(`Restaurant in req: ${restaurantInReq}`);

	

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
			if(menuFromDb){
				menu['gst'] = menuFromDb.gst;
				menu['price_includes_gst'] = menuFromDb.price_includes_gst;
			}
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
				totalPriceFromDb = totalPriceFromDb.toFixed(2);
				//At this stage, the variable totalPriceFromDb has the original total mrp price without mrp discount calculated form DB values.
				//so this value should be equal to the totalMrpPrice passed from the FE
				if((totalPriceFromDb !== totalMrpPrice))
					foundMistake = true;
				
				// var discountOnMrp = parseInt(restaurantInReq.restaurant_branches[0].discount_on_mrp);
				var discountOnMrp = calculateDiscountOnMrp(restaurantInReq, totalPriceFromDb);
				var totalPriceFromDbWithMrpDiscount = totalPriceFromDb;
				if(discountOnMrp && discountOnMrp > 0){
					totalPriceFromDbWithMrpDiscount = totalPriceFromDb - ((discountOnMrp/100)*totalPriceFromDb);
				}
				//TODO: Temporarily adding the default_delivery_charge calculation as well on the total amount
				// we have to revisit this calcualtion once after we have done the proper delivery charge calculation
				var deliveryCharge = calculateDeliveryCharge(restaurantInReq, deliveryDistance, totalPriceFromDb);
				if((data.deliveryChargeFromFE && parseFloat(data.deliveryChargeFromFE).toFixed(2) !== parseFloat(deliveryCharge).toFixed(2))){
				 	console.log("Found mistake inside delivery charge checking");
					foundMistake = true;
				}
				totalPriceFromDbWithMrpDiscount = parseFloat(totalPriceFromDbWithMrpDiscount) + (deliveryCharge > 0 ? deliveryCharge : 0);

				//Applying GST & delivery charge on the discounted final price
				totalPriceFromDbWithMrpDiscount = parseFloat(totalPriceFromDbWithMrpDiscount) + parseFloat(((gstPercentage/100) * totalPriceFromDbWithMrpDiscount));

				//totalPriceFromDbWithMrpDiscount = parseFloat(totalPriceFromDbWithMrpDiscount).toFixed(2);
				totalPriceFromDbWithMrpDiscount = convertToDecimal(totalPriceFromDbWithMrpDiscount);
				console.log(typeof totalPrice);
				console.log(typeof totalPriceFromDbWithMrpDiscount);
				if((totalPriceFromDbWithMrpDiscount !== totalPrice))
					foundMistake = true;
				console.log(typeof totalPrice);
				console.log(typeof totalPriceFromDbWithMrpDiscount);
				console.log("Total price sent by client - "+totalPrice);
				console.log("Total price from DB - "+totalPriceFromDbWithMrpDiscount);
				console.log("total mrp by client - "+totalMrpPrice);
				console.log("total mrp by DB - "+totalPriceFromDb);
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
		menus = req.body.menus;
		var restaurantInRequest = await Restaurant.findOne({
			where: {
				id: req.restuarantBranch.restaurant_id
			},
			include:[
				{ model: RestaurantWebsiteDetail, as: 'restaurant_website_detail'},
				{ model: RestaurantBranch, as: 'restaurant_branches'}
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
						
						verifyDiscountedPrice({
							// 'menus': menus,
							'totalPrice' : req.body.total_price,
							'totalMrpPrice': req.body.total_mrp_price,
							'restaurantInReq': restaurantInRequest,
							'deliveryDistance': req.body.delivery_distance,
							'deliveryChargeFromFE': req.body.delivery_charge
						}, function(foundMistake){ //This is to verify whether the calculated discount value in the UI is correct or not
							if(!foundMistake){
								var orderData = {
									customer_id: req.customer.id,
									restuarant_branch_id: req.restuarantBranch.id,
									description: req.body.description,
									total_price: req.body.total_price,
									total_mrp_price: req.body.total_mrp_price,
									delivery_charge: req.body.delivery_charge,
									gst: getGstPercentage(restaurantInRequest),
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
											original_price: menu.originalPrice,
											gst: menu.gst,
											price_includes_gst: menu.price_includes_gst
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

										PushNotificationController.sendOrderNotification({
											customerId: req.restaurantData.customer_id,
											restaurantName: restaurantData.name,
											orderId: createdOrder.id
										});

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

										//Triggering messages to smartdiner official & sharmi's personal numbers
										smsHelper.triggerTransactionalSms(
											8825906491,
											constants.countryDialCode.india,
											[restaurantData.name],
											'RESTAURANT_NEW_ORDER_RECEIVED', //message template name
											null
										);
										smsHelper.triggerTransactionalSms(
											7904465474,
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
						],
						[
							{ model: DeliveryRequest, as: 'delivery_requests', required: false }, 'created_at', 'DESC',
						]
					],
					include:[
						{ model: Cancellation, as: 'cancellation', required: false },
						{ model: Payment, as: 'payments', required: false },
						{ model: DeliveryRequest, as: 'delivery_requests',  required: false,
							include: [
								{ model: Customer, as: 'delivery_person', required: true },
							]
						}
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
											dataToSend['deliveryRequestStageId'] = (order.delivery_requests && order.delivery_requests[0]) ? order.delivery_requests[0].delivery_stage_id : null;
											dataToSend['deliveryPersonName'] = (order.delivery_requests && order.delivery_requests[0]) ? order.delivery_requests[0].delivery_person.name : null;
											dataToSend['deliveryPersonContactNumber'] = (order.delivery_requests && order.delivery_requests[0]) ? order.delivery_requests[0].delivery_person.mobile : null;
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

//this function is to do the reverse calculation.
//If we have the final amount & the applied percentage then we need to find out the base value
getBaseValue = (percentage, finalValue) => {
  /*
  Basic formula -> x + (x*(p/100))=y
  p=percentage, x=base value, y=final value
  Formula: x=y/(1+(p/100))
  */
  return (finalValue / (1 + (percentage/100)));
}

getPercentageFromBaseAndFinalValue = (baseValue, finalValue) => {
  /*
  Basic formula -> x + (x*(p/100))=y
  p=percentage, x=base value, y=final value
  Formula: p=(1-(y/x))*100
  */
  return (1-(finalValue/baseValue))*100;
}

exports.getInvoiceForTheOrder = async (req, res) => {
	if(req.params.orderId){
		var order = await Order.findOne({
			where: {
				id: req.params.orderId
			},
			order: [
				[
					{ model: Payment, as: 'payments', required: false }, 'created_at', 'DESC',
				]
			],
			include:[
				{ model: Customer, as: 'customer', required: true},
				{ model: Payment, as: 'payments', required: false },
				{ model: RestaurantBranch, as: 'restuarant_branch', required: true,
					include: [
						{ model: Restaurant, as: 'restaurant', required: true },
					]
				},
				{ model: OrderDetailMenu, as: 'order_detail_menus', required: true,
					include: [
						{ model: OrderDetail, as: 'order_detail', required: true },
						{ model: MenuQuantityMeasurePrice, as: 'menu_quantity_measure_price', required: true,
							include: [
								{ model: Menu, as: 'menu', required: true }
							]
						}
					]
				}
			]
		});
		if(order){
			try{
				var products = [];
				var totalTaxableAmount = 0;
				var totalTax = 0;

				var deliveryGstAmount = 0;
				var deliveryProduct = null;
				if(order.delivery_charge && order.delivery_charge > 0){ // Add the delivery charge also one of the products
					if(order.gst){
						deliveryGstAmount =  order.delivery_charge * (order.gst/100);
					}
					deliveryProduct = {
						"name": "Delivery Charge",
						"originalPrice": parseFloat(order.delivery_charge).toFixed(2),
						"cgst": (deliveryGstAmount/2).toFixed(2),
						"sgst": (deliveryGstAmount/2).toFixed(2),
						"total": (parseFloat(order.delivery_charge) + parseFloat(deliveryGstAmount)).toFixed(2)
					};
					totalTax += parseFloat(deliveryGstAmount);
					totalTaxableAmount += parseFloat(order.delivery_charge);
				}
				var orderPriceWithoutDeliveryCharge = order.total_price-order.delivery_charge-deliveryGstAmount; //Reducing delivery charge + delivery charge's GST also
				var orderBaseAmountWithoutGst = getBaseValue(order.gst, orderPriceWithoutDeliveryCharge);
				var orderGstAmount = orderBaseAmountWithoutGst * (order.gst/100);
				var orderDiscountedPercentage = (getPercentageFromBaseAndFinalValue(order.total_mrp_price, orderBaseAmountWithoutGst));
				var promises = order.order_detail_menus.map(async (menu, index) => {
					var menuQuantityMeasurePriceDetail = await MenuQuantityMeasurePrice.findOne({
						where: {
							id: menu.menu_quantity_measure_price.id
						},
						include:[
							{ model: QuantityValue, required: true, as: 'quantity_values' },
							{ model: MeasureValue, required: true, as: 'measure_values' }
						]
					});
					var gstAmount = 0;
					var quantity = menu.order_detail.quantity;
					var price = menu.order_detail.price * quantity;
					var originalPrice = menu.order_detail.original_price * quantity;
					product = {
						"name": menu.menu_quantity_measure_price.menu.name,
						"itemMeasureQuantity": menuQuantityMeasurePriceDetail.quantity_values.quantity + " " + menuQuantityMeasurePriceDetail.measure_values.name,
						"quantity": menu.order_detail.quantity
					};
					var itemDiscountedAmount = originalPrice - price;
					var orderDiscountAmount = parseFloat(price) * (parseFloat(orderDiscountedPercentage)/100);
					var priceAfterOrderDicsount = price - orderDiscountAmount;
					if(menu.order_detail.gst){
						if(menu.order_detail.price_includes_gst){
							var priceWithoutGst = getBaseValue(menu.order_detail.gst, priceAfterOrderDicsount);
							var originalPriceWithoutGst =  getBaseValue(menu.order_detail.gst, originalPrice);
							gstAmount = priceAfterOrderDicsount - priceWithoutGst;
						}
						else{
							var priceWithoutGst = priceAfterOrderDicsount;
							var originalPriceWithoutGst =  originalPrice;
							gstAmount = priceWithoutGst * (menu.order_detail.gst/100);
						}
					}
					else {
						var priceWithoutGst = priceAfterOrderDicsount;
						var originalPriceWithoutGst =  originalPrice;
						if(order.gst)
							gstAmount = priceWithoutGst * (order.gst/100);
					}
					originalPriceWithoutGst = parseFloat(originalPriceWithoutGst);
					product["originalPrice"] = originalPriceWithoutGst.toFixed(2);
					product["itemDiscount"] = itemDiscountedAmount.toFixed(2);
					product["orderDiscount"] = orderDiscountAmount.toFixed(2);
					product["priceAfterDiscount"] = priceWithoutGst.toFixed(2);
					totalTaxableAmount += parseFloat(product["priceAfterDiscount"]);
					totalTax += parseFloat(gstAmount);
					product["cgst"] = (gstAmount/2).toFixed(2);
					product["sgst"] = (gstAmount/2).toFixed(2);
					product["tgst"] = null;
					product["total"] = parseFloat((priceWithoutGst + gstAmount)).toFixed(2);
					products.push(product);
				});
				promises = await Promise.all(promises)
				products.push(deliveryProduct); // Add the delivery charge also one of the products
				// if(order.delivery_charge && order.delivery_charge > 0){
				// 	var product = null;
				// 	gstAmount = 0;
				// 	if(order.gst){
				// 		gstAmount =  order.delivery_charge * (order.gst/100);
				// 	}
				// 	product = {
				// 		"name": "Delivery Charge",
				// 		"originalPrice": parseFloat(order.delivery_charge).toFixed(2),
				// 		"cgst": (gstAmount/2).toFixed(2),
				// 		"sgst": (gstAmount/2).toFixed(2),
				// 		"total": (parseFloat(order.delivery_charge) + parseFloat(gstAmount)).toFixed(2)
				// 	};
				// 	totalTax += parseFloat(gstAmount);
				// 	totalTaxableAmount += parseFloat(order.delivery_charge);
				// 	products.push(product);
				// }
				var invoiceTotal = (parseFloat(totalTaxableAmount) + parseFloat(totalTax)).toFixed(2);
				var invoiceData = {
					"company": {
						"companyName": order.restuarant_branch.restaurant.name,
						"gstin": order.restuarant_branch.restaurant.gstin,
						"state": null,
						"pan": order.restuarant_branch.restaurant.pan,
						"invoiceDate": date.format(new Date(), 'DD/MMM/YYYY'),
						"invoiceNumber": order.id,
						"refNo": null
					},
					"customer": {
						"name": order.customer.name,
						"customerGstin": null,
						"billingAddress": order.delivery_address_one + order.delivery_address_two,
						"billingGstin": null,
						"billingState": null,
						"billingPan": null,
						"shippingAddress": order.delivery_address_one + order.delivery_address_two,
						"shippingGstin": null,
						"shippingState": null,
						"shippingPan": null
					},
					"order": {
						"totalTaxableAmount": totalTaxableAmount.toFixed(2),
						"totalTax": totalTax.toFixed(2),
						"deliveryCharge": parseFloat(order.delivery_charge).toFixed(2),
						"invoiceTotal": invoiceTotal,
						// "invoiceTotalInWords": numWords(invoiceTotal),
						"invoiceTotalInWords": helper.convertToWords(invoiceTotal),
						"products": products
					}
				};
				res.status(200).send({
					invoiceData: invoiceData
				});
			}
			catch(e) {
				console.log("Exception happened inside invoice generator function.");
				console.log(e);
				res.status(500).send({ message: "Exception happened inside invoice generator function" });
			}
		}
		else return res.status(404).send({ message : 'Could not find the order. Please try again'});
	}
	else{
		return res.status(404).send({ message : 'Illegal request'});
	}
};

