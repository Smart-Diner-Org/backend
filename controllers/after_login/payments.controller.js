var Payment = require('./../../models/Payment');
var Refund = require('./../../models/Refund');
var Order = require('./../../models/Order');
var request= require('request');
var helper = require('./../../helpers/general.helper');
var constants = require('../../config/constants');
// var helper = require('./../../helpers/general.helper');

var headers = {
	'X-Api-Key': process.env.INSTAMOJO_API_KEY,
	'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
};

exports.createRequest = (req, res) => {
	var orderId = req.orderId;
	var purpose = req.restaurantData.name + '_' + orderId;
	// var redirect_url = 'https://da8e6720b73f.ngrok.io' + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
	var redirect_url = req.restaurantData.url + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
	var webhook = process.env.BACKEND_API_URL + process.env.INSTAMOJO_WEBHOOK_END_POINT;
	console.log("redirect_url url");
	console.log(redirect_url);
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
				console.log("check Here 3");
				res.status(200).send({ 'paymentUrl' : paymentRequest.longurl });
			})
			.catch(err => {
				console.log("check Here 4");
				console.log(err);
				updateOrderStatus(req, res, {error : err, status : 'paymentRequestFailed'});
			});
		}
		else{
			console.log("check Here 5");
			updateOrderStatus(req, res, {error : body, status: 'paymentRequestFailed'});
			// // Save the error somewhere / email the body
		}
	});
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
	var paymentStatusId = helper.getPaymentStatusId(data.status, function(paymentStatusId){
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
	console.log("Have reached webhook...");
	console.log(req.body);
	res.status(200).send({ message: 'success' });
};

exports.checkPaymentStatus = (req = null, res = null, payment = null) => {
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
						updateOrderStatus(req, res, { error : body, status: status, orderId: payment.order_id  });
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
};

exports.createRefund = (req, res, paymentData = null, cb = null) => {
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
};