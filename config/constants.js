module.exports = {
	whitelistWebsites: {
		local : ['localhost:3000'],
		production : ['smartdiner.co', 'deliverypartner.smartdiner.co'],
		testing: ['testingfrontend.smartdiner.co', 'testingdeliverypartner.smartdiner.co']
	},
	roles: {
		'superAdmin': 1,
		'admin': 2,
		'deliveryAgent': 3,
		'customer': 4,
		'smartDinerSuperAdmin': 5,
		'deliveryPartnerAdmin': 6
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
	gstDefaultPercentage: {
		restaurant: 5,
		eCommerce: 18
	},
	deliveryPreferences: {
		'inHouse' : 1,
		'service' : 2,
		'all' : 3
	},
	deliveryPartners: {
		"inHouseDelivery" : 1,
		"kovaiDeliveryBoys" : 2,
		"individualPartners" : 3,
		"dunzo": 4
	},
	deliveryStages: {
		"requested" : 1,
		"accepted" : 2,
		"rejected" : 3,
		"reassigned" : 4,
		"completed" : 5,
		"delayed" : 6,
		"undelivered" : 7,
		"reachedForPickup": 8,
		"picked": 9,
		"reachedForDelivery": 10,
		"runnerCancelled": 11
	},
	deliveryPartnerPortalUrl: {
		testing : 'https://testingdeliverypartner.smartdiner.co/',
		prod : 'https://deliverypartner.smartdiner.co/'
	},
	pushNotificationTokenStatuses: {
		"active": 1,
		"unregistered": 2,
		"invalidArgument": 3
	},
	app: {
		"channels":{
			'orders': "ORDERS",
			'offers': "OFFERS"
		}
	},
	delivery: {
		dunzoServiceCities: [
			2, //Chennai
			3, //Bangalore
			6, //Mumbai
			7 //Pune
		]
	},
	orderStatges: {
		"fresh": 1,
		"accepted": 2,
		"preparing": 3,
		"foodReady": 4,
		"foodPicked": 5,
		"outForDelivery": 6,
		"delivered": 7,
		"completed": 8,
		"cancelled": 9,
	}
}


