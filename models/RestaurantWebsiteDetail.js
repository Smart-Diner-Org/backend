const Sequelize = require('sequelize');
var db = require('./../config/database');

const RestaurantWebsiteDetail = db.define('restaurant_website_details', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	is_pre_booking_enabled: {
		type: Sequelize.BOOLEAN
	},
	is_pre_booking_time_required: {
		type: Sequelize.BOOLEAN
	},
	is_pick_my_location_enabled: {
		type: Sequelize.BOOLEAN
	},
	is_payment_gateway_enabled: {
		type: Sequelize.BOOLEAN
	},
	is_cod_enabled: {
		type: Sequelize.BOOLEAN
	},
	page_description: {
		type: Sequelize.TEXT
	},
	slider_images: {
		type: Sequelize.TEXT
	},
	ga_tracking_id: {
		type: Sequelize.TEXT
	},
	about_image: {
		type: Sequelize.TEXT
	},
	pre_order_info_image: {
		type: Sequelize.TEXT
	}
},{
	underscored: true
});

module.exports = RestaurantWebsiteDetail;