var admin = require("firebase-admin");
var constants = require('./../../config/constants');

var serviceAccount = require('./../../../smart-diner-16538-firebase-adminsdk-849q5-ee8f48ef58.json');

admin.initializeApp({
	  	credential: admin.credential.cert(serviceAccount),
		// databaseURL: "https://prismappfcm.firebaseio.com"
	});

exports.sendOrderPushNotification = async (data) => {
	console.log("data to send order received push notification");
	console.log(data);
	const message = {
		"notification":{
			"title": data["restaurantName"] + ", Received a new order!",
			"body":"Click here to check"
		},
		"android": {
			"notification": {
				"channel_id": constants.app.channels.orders
			}
        },
        "fcmOptions": {
          "analyticsLabel": "order_received"
        },
		tokens: data['tokens']
	};
	admin.messaging().sendMulticast(message)
	  .then((response) => {
	  	console.log(response);
	    console.log('Successfully sent the order creation push notification message for the order - ' + data.orderId);
	  })
	  .catch((error) => {
	    console.log('Error sending message:', error);
	  });
}

exports.sendPushNotification = async (req, res) => {
	const registrationToken = 'huSz6Pg0NUXfjYN0:APA91bHPlxhI1igdQLxRyb-HMomC7F3wAJnE9DrKyvGi1AREEGhnwFkMw8l-OCV64CO2-Zm3m0tcqk2cJDv8gdwxR51g7Q7nVuJBOCrd_3Sh2VGI6Y7B6gg62w3OZrBFNeXViTvGTUOj';
	const message = {
	  // data: {
	  //   score: '850',
	  //   time: '2:45'
	  // },
		"notification":{
			"title":"Portugal vs. Denmark 1",
			"body":"great match!"
		},
		"android": {
			"notification": {
				"channel_id": constants.app.channels.orders
			}
        },
        "fcmOptions": {
          "analyticsLabel": "order_received"
        },
		token: registrationToken
	};

	// Send a message to the device corresponding to the provided
	// registration token.
	admin.messaging().send(message)
	  .then((response) => {
	    // Response is a message ID string.
	    console.log('Successfully sent message:', response);
	    res.status(200).send({
				response: response
			});
	  })
	  .catch((error) => {
	    console.log('Error sending message:', error);
	    res.status(500).send({ message: error });
	  });
};

