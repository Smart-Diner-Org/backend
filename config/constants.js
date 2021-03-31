module.exports = {
	whitelistWebsites: {
		local : 'localhost:3000',
		production : 'smartdiner.co',
		testing: 'testingfrontend.smartdiner.co'
	},
	roles: {
		'superAdmin': 1,
		'admin': 2,
		'deliveryAgent': 3,
		'customer': 4,
		'smartDinerSuperAdmin': 5
	},
	instamojo: {
		paymentRequestStatus: {
			pending: 'Pending'
		},
		paymentStatus: {
			credit: 'Credit',
			failed: 'Failed'
		}
	},
	messageRouteType: {
		'transactional': 4,
		'promotional': 1
	},
	countryDialCode: {
		india: "91",
		usa: "1",
		uk: "44"
	},
	paymentType: {
		cashOnDelivery: 1,
		onlinePayment: 2
	},
	paymentStatuses: {
		"paid" : 1,
		"notPaid" : 2,
		"paymentFailed": 3,
		"paymentRequestFailed": 4
	},
	getLocationPlaces: {
		'beforeAddToCart': 1,
		'whileAddingAddress': 2
	},
	getLocationTypes: {
		'googleLocation': 1,
		'dropdownLocation': 2
	},
	deliveryPreferences: {
		'inHouse' : 1,
		'service' : 2,
		'all' : 3
	},
	deliveryPartners: {
		"inHouseDelivery" : 1,
		"kovaiDeliveryBoys" : 2,
		"individualPartners" : 3
	},
	deliveryStages: {
		"requested" : 1,
		"accepted" : 2,
		"rejected" : 3,
		"reassigned" : 4,
		"completed" : 5,
		"delayed" : 6,
		"undelivered" : 7
	}
}