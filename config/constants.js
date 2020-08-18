module.exports = {
	whitelistWebsites: {
		local : 'localhost:3000',
		production : 'smartdiner.in'
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
	}
}