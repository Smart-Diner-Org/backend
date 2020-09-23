var Payment = require('./../../models/Payment');
var Refund = require('./../../models/Refund');
var Order = require('./../../models/Order');
var Customer = require('./../../models/Customer');
var RestaurantBranch = require('./../../models/RestaurantBranch');
var Restaurant = require('./../../models/Restaurant');
var request= require('request');
var helper = require('./../../helpers/general.helper');
var constants = require('../../config/constants');
var smsHelper = require('./../../helpers/sms.helper');

var headers = {
	'X-Api-Key': process.env.INSTAMOJO_API_KEY,
	'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
};

exports.createRequest = (req, res) => {
	if(helper.isProduction){ // This is a compulsory check for all the payment related functions which make calls to payment gateway (here instamojo)
		var orderId = req.orderId;
		var purpose = req.restaurantData.name + ' Order Id - ' + orderId;
		switch(process.env.ENVIRONMENT){
			case 'production':
				purpose = purpose;
				break;
			default:
				purpose = process.env.ENVIRONMENT + ' - ' + purpose;
				break;
		}
		// var redirect_url = 'https://cca9c3bb71c9.ngrok.io' + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
		var redirect_url = 'https://' + req.restaurantData.url + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
		redirect_url = redirect_url.replace("__id__", orderId);
		var webhook = process.env.BACKEND_API_URL + process.env.INSTAMOJO_WEBHOOK_END_POINT;
		var payload = {
			purpose: purpose,
			amount: req.amount,
			phone: req.customer.mobile,
			buyer_name: req.customer.name,
			redirect_url: redirect_url,
			send_email: false,
			webhook: webhook,
			send_sms: false,
			email: null,
			allow_repeated_payments: false,
			// expires_at: 600 //seconds
		};
		if(req.customer.email)
			payload['email'] = req.customer.email;
		request.post(process.env.INSTAMOJO_PAYMENT_REQUEST, {
			form: payload,
			headers: headers
		}, function(error, response, body){
			if(!error && response.statusCode == 201){
				var paymentRequest = JSON.parse(body).payment_request;
				var paymentDataToCreate = {
					order_id: orderId,
					payment_request_id: paymentRequest['id'],
					purpose: paymentRequest['purpose'],
					payment_request_status: paymentRequest['status'],
					payment_url_long: paymentRequest['longurl'],
					amount: req.amount
				};
				Payment.create(paymentDataToCreate)
				.then(payment => {
					res.status(200).send({ 'paymentUrl' : paymentRequest.longurl });
				})
				.catch(err => {
					console.log(err);
					updateOrderStatus(req, res, {error : err, status : 'paymentRequestFailed'});
				});
			}
			else{
				updateOrderStatus(req, res, {error : body, status: 'paymentRequestFailed'});
				// // Save the error somewhere / email the body
			}
		});
	}
	else{
		res.status(500).send({ 'message' : 'You can not make payments for testing' });
	}
};

updateOrderStatus = (req, res, data) => {
	var orderId;
	if(data){
		if(req){
			orderId = req.orderId;
		}
		else{
			orderId = data.orderId;
		}
	}
	else{
		console.log("Parameter missing");
		return;
	}
	helper.getPaymentStatusId(data.status, function(paymentStatusId){
		Order.findByPk(orderId)
		.then(orderData => {
			orderData.update({ 'payment_status_id' : paymentStatusId });
		})
		.catch(err => {
			if(res)
				res.status(500).send({ message: err });
			else{
				console.log('Failed to update the order status during cron');
				console.log(err);
			}
		});
		if(res)
			res.status(500).send({ message: data.error });
	});
	
}

exports.paymentWebhook = (req, res) => {
	if(helper.isProduction){
		console.log("Have reached webhook...");
		console.log(req.body);
		console.log("************ webhook body displayed ************");
		console.log("************ webhook body displayed ************");
		console.log("************ webhook body displayed ************");
		console.log(req);
		res.status(200).send({ message: 'success' });
	}
};

exports.checkPaymentStatus = (req = null, res = null, payment = null) => {
	if(helper.isProduction){
		try{
			console.log(payment.id);
			if(payment){
				request.get(process.env.INSTAMOJO_PAYMENT_REQUEST + payment.payment_request_id, {headers: headers}, function(error, response, body){
					if(!error && response.statusCode == 200){
						var paymentDetails = JSON.parse(body).payment_request;
						if(payment.payment_request_status.trim() !== paymentDetails.status.trim()){
							payment.update({payment_request_status : paymentDetails.status});
						}
						if(paymentDetails.payments && paymentDetails.payments.length > 0){
							Order.findOne({
								where: {
									id : payment.order_id
								},
								include:[
									{ model: Customer, as: 'customer', required: false },
									{ model: RestaurantBranch, as: 'restuarant_branch', required: false,
										include: [ { model: Restaurant, as: 'restaurant', required: false } ] }
								]
							})
							.then(orderFound => {
								if(!orderFound || !orderFound.customer || !orderFound.restuarant_branch || !orderFound.restuarant_branch.restaurant){
									console.log("Could not found the order or customer or restaurant or restaurant branch to update");
									return;
								}
								payment.update({
									payment_id : paymentDetails.payments[0].payment_id,
									payment_status : paymentDetails.payments[0].status
								});
								var status;
								switch(paymentDetails.payments[0].status){
									case constants.instamojo.paymentStatus.credit:
										status = 'paid';
									break;
									case constants.instamojo.paymentStatus.failed:
										status = 'paymentFailed';
									break;
								}
								updateOrderStatus(req, res, { error : body, status: status, orderId: payment.order_id, });
							})
							.catch(err => {
								console.log("got error in finding the order while updating the payments");
							});
						}
					}
					else{
						console.log("Check payment request status got failed");
						console.log(body);
					}
				});
			}
		}
		catch(e) {
			console.log("Exception happened inside checkPaymentStatus function.");
			console.log(e);
		}
	}
};

exports.createRefund = (req, res, paymentData = null, cb = null) => {
	if(helper.isProduction){
		var refundCreationSuccess = false;
		if(paymentData && paymentData.refundType){
			payload = {
				transaction_id: paymentData.refundType + "_refund_" + paymentData.payment.id,
				payment_id: paymentData.payment.payment_id,
				type: "TAN",
				body: paymentData.refundReason
			};

			request.post(process.env.INSTAMOJO_CREATE_REFUND, {form: payload,  headers: headers}, function(error, response, body){
				if(!error && response.statusCode == 201){
					var refund = JSON.parse(body).refund;
					refundData = {
						payment_id: paymentData.payment.id,
						transaction_id: payload.transaction_id,
						type: payload.type,
						body: payload.body,
						status: refund.status,
						refund_id: refund.id,
						refund_amount: refund.refund_amount,
						total_amount: refund.total_amount,
					};
					Refund.create(refundData)
					.then(refundObject => {
						refundCreationSuccess = true;
						if(cb){
							cb(refundCreationSuccess, null);
						}
					})
					.catch(err => {
						if(cb){
							cb(refundCreationSuccess, err);
						}
					})
					;
				}
				else{
					console.log("failed to create refund for the payment - " + paymentData.payment.id);
					console.log(body);
					if(cb){
						cb(refundCreationSuccess, body);
					}
				}
			});
		}
		else{
			if(cb){
				cb(refundCreationSuccess, 'paymentData is missing');
			}
		}
	}
	else{
		if(cb){
			cb(true, null);
		}
	}
};