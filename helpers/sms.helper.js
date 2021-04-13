var constants = require('./../config/constants');
var smsTemplates = require('./../config/sms_templates');
const SendOtp = require('sendotp');
const otpMessage = 'Otp to login is {{otp}}, please do not share it with anybody';
var http = require("https");
const querystring = require('querystring');

switch(process.env.ENVIRONMENT){
	case 'production':
		var API_KEY = process.env.MSG_SERVICE_PRODUCTION_API_KEY;
		var MESSAGE_SENDER = process.env.MSG_SERVICE_PRODUCTION_MESSAGE_SENDER;
		break;
	default:
		var API_KEY = process.env.MSG_SERVICE_TESTING_API_KEY;
		var MESSAGE_SENDER = process.env.MSG_SERVICE_TESTING_MESSAGE_SENDER;
		break;
}
const sendOtp = new SendOtp(API_KEY, otpMessage);
const sendSmsService = require('msg91-sdk').SendSmsService;
const sendTransactionalSms = new sendSmsService(API_KEY, MESSAGE_SENDER, constants.messageRouteType.transactional);
sendOtp.setOtpExpiry('5'); //minutes

module.exports.triggerOtp = (mobile, countryDialCode, cb) => {
	var status = null;
	sendOtp.send(countryDialCode + mobile, MESSAGE_SENDER, function (error, data) {
		if(data && data.type == 'success')
			status = true;
		else{
			console.log("Send OTP Failed : ");
			console.log(data);
			status = false;
		}
		if(cb)
			cb(status)
		else return status;
	});
}

module.exports.verifyOtp = (mobile, countryDialCode, otp, cb) => {
	sendOtp.verify(countryDialCode + mobile, otp, function (error, data) {
		if(data && data.type == 'success')
			status = true;
		else{
			console.log("Verify OTP Failed : ");
			console.log(data);
			status = false;
		}
		cb(status, data.message);
	});
}

module.exports.resendOtp = (mobile, countryDialCode, retryVoice, cb) => {
	sendOtp.retry(countryDialCode + mobile, retryVoice, function (error, data) {
		if(data.type == 'success')
			status = true;
		else{
			console.log("Retry OTP Failed : ");
			console.log(data);
			status = false;
		}
		cb(status, data.message);
	});
}

getMessageContent = (messageValues, templateName, type) => {
	var messageContent = smsTemplates[type][templateName];
	messageValues.forEach(value => {
		messageContent = messageContent.replace("{#var#}", value);
	});
	return messageContent;
}

getTemplateId = (templateName, type) => {
	var templateIds = JSON.parse(process.env.DLT_TE_IDS);
	return templateIds[type][templateName];
}

module.exports.triggerTransactionalSms = (mobileNumber, countryDialCode, messageValues, templateName, cb) => {
	var messageContent = getMessageContent(messageValues, templateName, 'TRANSACTIONAL');
	var templateId = getTemplateId(templateName, 'TRANSACTIONAL');
	const parameters = {
		"sender": MESSAGE_SENDER,
		"mobiles": mobileNumber,
		"route": "4",
		"country": countryDialCode,
		"message": messageContent,
		"DLT_TE_ID": templateId
	}
	// GET parameters as query string : "?id=123&type=post"
	const getRequestArgs = querystring.stringify(parameters);
	var options = {
		// "method": "POST",
		"hostname": "api.msg91.com",
		"port": null,
		"path": "/api/sendhttp.php?" + getRequestArgs,
		"headers": {
			"authkey": API_KEY,
			"content-type": "application/x-www-form-urlencoded"
		}
	};
	var req = http.request(options, function (res) {
		var chunks = [];
		res.on("data", function (chunk) {
			chunks.push(chunk);
		})
		res.on("end", function () {
			var body = Buffer.concat(chunks);
			console.log(body.toString());
		})
	})

	req.on('error', error => {
		console.error("Error error...");
		console.error(error)
	})
	req.end()

	/*sendTransactionalSms.sendSMS(mobileNumber, messageContent, countryDialCode).then((error, data) => {
	}).catch((error, data) => {
		console.log("failed to send transactional message");
		console.log(error);
		console.log(data);
	});*/
}

//TODO: The below function is for sending messages using MSG91's flows but the below API is not working. In future we might need to implement this.
/*module.exports.sendTransactionalSmsUsingFlow = () => {
	console.log("Have come here - testing new API 1");
	var options = {
		"method": "POST",
		"hostname": "api.msg91.com",
		"port": null,
		"path": "/api/v5/flow/",
		"headers": {
			"authkey": process.env.MSG_SERVICE_PRODUCTION_API_KEY,
			"content-type": "application/JSON"
		}
	};

	const data = JSON.stringify({
		"flow_id": "60753da0f606245e4b3332f3",
		"sender": "SDiner",
		"mobiles": "7904465474",
		"VAR1": "thezoomchefs.com",
		"VAR2": "/order/939/status",
		"VAR3": "Zoom Chef"
	});

	var req = http.request(options, function (res) {
		console.log("statusCode: ${res.statusCode}");
		console.log(res.statusCode);
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		})

		res.on("end", function () {
			console.log("Have come here - testing new API 2");
			var body = Buffer.concat(chunks);
			console.log(body.toString());
		})
	})

	req.on('error', error => {
		console.error("Error error...");
		console.error(error)
	})

	// var flowId='607437d4147be02a2a22e7ed'

	// req.write("{\"flow_id\":\"607437d4147be02a2a22e7ed\",\"sender\":\"SmarDi\",\"mobiles\":\"7904465474\",\"VAR1\":\"thezoomchefs.com\",\"VAR2\":\"/order/939/status\",\"VAR3\":\"Zoom Chef\"}");
	req.write(data)
	req.end()
}*/