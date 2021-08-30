var PushNotificationToken = require('./../../models/PushNotificationToken');
var PushNotificationTokenStatus = require('./../../models/PushNotificationTokenStatus');
var constants = require('./../../config/constants');

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