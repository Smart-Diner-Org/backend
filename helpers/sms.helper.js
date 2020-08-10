var constants = require('./../config/constants');
const SendOtp = require('sendotp');
const otpMessage = 'Otp for your food order is {{otp}}, please do not share it with anybody';
const sendOtp = new SendOtp(process.env.OTP_API_KEY, otpMessage);
sendOtp.setOtpExpiry('1'); //minutes

module.exports.triggerOtp = (mobile, cb) => {
	var status = null;
	sendOtp.send('91' + mobile, process.env.MESSAGE_SENDER, function (error, data) {
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
module.exports.verifyOtp = (mobile, otp, cb) => {
	sendOtp.verify('91' + mobile, otp, function (error, data) {
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
module.exports.resendOtp = (mobile, retryVoice, cb) => {
	sendOtp.retry('91' + mobile, retryVoice, function (error, data) {
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