var constants = require('./../config/constants');
const SendOtp = require('sendotp');
const otpMessage = 'Otp to login is {{otp}}, please do not share it with anybody';

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
		if(data.type == 'success')
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
		if(data.type == 'success')
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

module.exports.triggerTransactionalSms = (mobileNumber, countryDialCode, messageContent, cb) => {
	sendTransactionalSms.sendSMS(mobileNumber, messageContent, countryDialCode).then((error, data) => {
	}).catch((error, data) => {
		console.log("failed to send transactional message");
		console.log(error);
		console.log(data);
	});
}
