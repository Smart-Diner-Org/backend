var PushNotificationToken = require('./../../models/PushNotificationToken');
var PushNotificationTokenStatus = require('./../../models/PushNotificationTokenStatus');
var constants = require('./../../config/constants');
var FcmController = require('./fcm.controller');

exports.savePushNotificationTokenWithCustomerId= async (req, res) => {
	try{
		var savedPushNotification = null;
		if(req.body.token && req.params.customerId){
			var foundPushNotification = await PushNotificationToken.findOne({
				where: {
					token: req.body.token
				}
			});
			if(foundPushNotification){
				savedPushNotification = await foundPushNotification.update({
					token_timestamp: Date.now(),
					customer_id: req.params.customerId
				});
			}
			else {
				var tokenData = {
					token: req.body.token,
					token_status: constants.pushNotificationTokenStatuses.active,
					token_timestamp: Date.now(),
					customer_id: req.params.customerId
				};
				savedPushNotification = await PushNotificationToken.create(tokenData);
			}
			if(savedPushNotification) return res.status(200).send({ message: "Successfully saved the fcm token" });
			else return res.status(404).send({ message: "Something happened, could't save. Please try again." });
		}
		else return res.status(404).send({ message: "Token is missing." });
	}
	catch(exception){
		return res.status(500).send({ message: exception.message });
	}
};

exports.sendOrderNotification = async (data) => {
	try {
		var tokens = [];
		var tokensArray = await PushNotificationToken.findAll({
			attributes: ['token'],
			where: {
				customer_id: data.customerId,
				token_status: constants.pushNotificationTokenStatuses.active
			}
		});
		tokensArray.forEach((notiToken, index) => {
			tokens.push(notiToken['token']);
		});
		data['tokens'] = tokens;
		FcmController.sendOrderPushNotification(data);
	}
	catch(exception){
		console.log("exception happened while fetching the push notification tokens");
	}
};


