var constants = require('./../config/constants');
var PaymentStatus = require('./../models/PaymentStatus');
var OrderStage = require('./../models/OrderStage');
var _ = require('underscore');
var isProduction = process.env.ENVIRONMENT == 'production' ? true : false;
// var isProduction = true;

module.exports.isProduction = isProduction;

module.exports.isMobileLoginRole = (roleId) => {
	return (roleId == constants.roles.customer) || (roleId == constants.roles.deliveryAgent);
}
module.exports.isEmailLoginRole = (roleId) => {
	return (roleId == constants.roles.superAdmin) || (roleId == constants.roles.admin) || (roleId == constants.roles.smartDinerSuperAdmin) || (roleId == constants.roles.deliveryPartnerAdmin);
}
module.exports.getPaymentStatusId = (statusName, cb) => {
	var paymentStatusId = null;
	try{
		PaymentStatus.findAll({
			attributes: ['name', 'id']
		})
		.then(paymentStatuses => {
			if (paymentStatuses) {
				var matchingName = null;
				switch(statusName){
					case 'paid':
						matchingName = 'Paid';
					break;
					case 'notPaid':
						matchingName = 'Not Paid';
					break;
					case 'paymentFailed':
						matchingName = 'Payment Failed';
					break;
					case 'paymentRequestFailed':
						matchingName = 'Payment Request Failed';
					break;
				}
				paymentStatuses.forEach(status => {
					if(status["name"].trim() === matchingName.trim()){
						paymentStatusId = status["id"];
					}
				});
			}
			else{
				console.log("Payment Statuses are not found. Inside general helper function.");
			}
			return cb(paymentStatusId);
		})
		.catch(err => {
			console.log("Exception happened while getting payment statuses inside general helper function.");
			return cb(paymentStatusId);
		});
	}
	catch (e) {
		console.log("Exception happened inside general helper function.");
		console.log(e);
		return cb(paymentStatusId);
	}
}

module.exports.getOrderStatusId = (stageName, cb) => {
	var orderStatusId = null;
	try{
		OrderStage.findAll({
			attributes: ['name', 'id']
		})
		.then(orderStages => {
			if (orderStages) {
				var matchingName = null;
				switch(stageName){
					case 'fresh':
						matchingName = 'Fresh';
					break;
					case 'accepted':
						matchingName = 'Accepted';
					break;
					case 'preparing':
						matchingName = 'Preparing';
					break;
					case 'foodReady':
						matchingName = 'Food Ready';
					break;
					case 'foodPicked':
						matchingName = 'Food Picked';
					break;
					case 'outForDelivery':
						matchingName = 'Out for Delivery';
					break;
					case 'delivered':
						matchingName = 'Delivered';
					break;
					case 'completed':
						matchingName = 'Completed';
					break;
					case 'cancelled':
						matchingName = 'Cancelled';
					break;
				}
				orderStages.forEach(status => {
					if(status["name"].trim() === matchingName.trim()){
						orderStatusId = status["id"];
					}
				});
			}
			else{
				console.log("Order Statuses are not found. Inside general helper function.");
			}
			return cb(orderStatusId);
		})
		.catch(err => {
			console.log("Exception happened while getting Order statuses inside general helper function.");
			return cb(orderStatusId);
		});
	}
	catch (e) {
		console.log("Exception happened inside general helper function.");
		console.log(e);
		return cb(orderStatusId);
	}
}

module.exports.getCurrentDate = (format) => {
	let date_ob = new Date();
	// current date
	// adjust 0 before single digit date
	let date = ("0" + date_ob.getDate()).slice(-2);
	// current month
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	// current year
	let year = date_ob.getFullYear();
	// current hours
	let hours = date_ob.getHours();
	// current minutes
	let minutes = date_ob.getMinutes();
	// current seconds
	let seconds = date_ob.getSeconds();

	switch(format){
		case 'YYYY-MM-DD':
			return (year + "-" + month + "-" + date);
			break;
		case 'HH:MM':
			return (hours + ":" + minutes);
			break;
		case 'YYYY-MM-DD HH:MM:SS':
		default:
			return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
			break;
	}

	// prints date in YYYY-MM-DD format
	console.log(year + "-" + month + "-" + date);
	// prints date & time in YYYY-MM-DD HH:MM:SS format
	console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
	// prints time in HH:MM format
	console.log(hours + ":" + minutes);
}

module.exports.getCorsUrlsList = (restaurants) => {
	var urls =  _.map(restaurants, function(menu) {
		if(menu.url)
			return menu.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
	});
	urls.push(...constants.whitelistWebsites[process.env.ENVIRONMENT]);
	return urls;
}

module.exports.getCorsFunction = (urls) => {
	return {
		origin: function (origin, callback) {
			console.log("urls");
			console.log(urls);
			console.log("origin");
			console.log(origin);
			if(!origin){
				callback(new Error('Not allowed by CORS'));
				return;
			}
			var ori = origin.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
			if (urls.indexOf(ori) !== -1) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		}
	};
}

module.exports.convertToWords = (number) => {
	var th = ['', 'thousand', 'million', 'billion', 'trillion'];
	var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
	var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

	number = number.toString();
	number = number.replace(/[\, ]/g, '');
	if (number != parseFloat(number)) return 'not a number';
	var x = number.indexOf('.');
	if (x == -1) x = number.length;
	if (x > 15) return 'too big';
	var n = number.split('');
	var str = '';
	var sk = 0;
	for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] != 0) {
                str += tw[n[i] - 2] + ' ';
                sk = 1;
            }
        } else if (n[i] != 0) {
            str += dg[n[i]] + ' ';
            if ((x - i) % 3 == 0) str += 'hundred ';
            sk = 1;
        }
        if ((x - i) % 3 == 1) {
            if (sk) str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
	if (x != number.length) {
		var y = number.length;
		str += 'point ';
		for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
	}
	return str.replace(/\s+/g, ' ');
}

