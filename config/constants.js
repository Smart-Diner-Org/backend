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
		'customer': 4
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
	}
}