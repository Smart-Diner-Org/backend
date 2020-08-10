var Payment = require('./../../models/Payment');
var Order = require('./../../models/Order');
var request= require('request');
var helper = require('./../../helpers/general.helper');

exports.createRequest = (req, res) => {
	var orderId = req.orderId;
	var purpose = req.restaurantData.name + '_' + orderId;
	// var redirect_url = 'https://da8e6720b73f.ngrok.io' + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
	var redirect_url = req.restaurantData.url + process.env.INSTAMOJO_REDIRECT_URL_END_POINT;
	var webhook = process.env.BACKEND_API_URL + process.env.INSTAMOJO_WEBHOOK_END_POINT;
	var headers = {
		'X-Api-Key': process.env.INSTAMOJO_API_KEY,
		'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
	};
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
				status: paymentRequest['status'],
				payment_url_long: paymentRequest['longurl']
			})
			.then(payment => {
				res.status(200).send({ 'paymentUrl' : paymentRequest.longurl });
			})
			.catch(err => {
				updatePaymentRequestFailed(req, res, err);
			});
		}
		else{
			updatePaymentRequestFailed(req, res, body);
			// // Save the error somewhere / email the body
		}
	});
};

updatePaymentRequestFailed = (req, res, error) => {
	var paymentStatusId = helper.getPaymentStatusId(req.paymentStatuses, 'paymentRequestFailed');
	Order.findByPk(req.orderId)
	.then(orderData => {
		orderData.update({ 'payment_status_id' : paymentStatusId });
	})
	.catch(err => {
		res.status(500).send({ message: err });
	});
	res.status(500).send({ message: error });
}


exports.paymentWebhook = (req, res) => {
	console.log("Have reached webhook...");
	console.log(req);
	res.status(200).send({ message: 'success' });
};



