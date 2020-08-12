var Payment = require('./../../models/Payment');
var Order = require('./../../models/Order');
var request= require('request');
var helper = require('./../../helpers/general.helper');
var constants = require('../../config/constants');

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
	console.log("webhook url");
	console.log(webhook);
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
			Payment.create({
				order_id: orderId,
				payment_request_id: paymentRequest['id'],
				purpose: paymentRequest['purpose'],
				payment_request_status: paymentRequest['status'],
				payment_url_long: paymentRequest['longurl']
			})
			.then(payment => {
				res.status(200).send({ 'paymentUrl' : paymentRequest.longurl });
			})
			.catch(err => {
				updateOrderStatus(req, res, {error : err, status : 'paymentRequestFailed'});
			});
		}
		else{
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
	console.log("data.status " + data.status);
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
						console.log("status - " + status);
						updateOrderStatus(req, res, { error : body, status: status, orderId: payment.order_id  });
					}
				}
				else{
					console.log("Check payment request status got failed");
					// console.log(response.statusCode);
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



