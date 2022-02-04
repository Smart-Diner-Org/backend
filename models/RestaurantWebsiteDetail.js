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
	},
	is_run_time_booking_enabled: {
		type: Sequelize.BOOLEAN
	},
	pre_book_prior_time: {
		type: Sequelize.INTEGER
	},
	primary_colour_code: {
		type: Sequelize.STRING
	},
	secondary_colour_code: {
		type: Sequelize.STRING
	},
	has_customisation_info: {
		type: Sequelize.BOOLEAN
	},
	customisation_info_content: {
		type: Sequelize.TEXT
	},
	cards: {
		type: Sequelize.TEXT
	},
	is_delivery_available: {
		type: Sequelize.BOOLEAN
	},
	page_title: {
		type: Sequelize.TEXT
	},
	should_calculate_gst: {
		type: Sequelize.BOOLEAN
	},
	min_purchase_amount: {
		type: Sequelize.DECIMAL
	},
	default_delivery_charge: {
		type: Sequelize.DECIMAL
	},
	gst_percentage: {
		type: Sequelize.VIRTUAL
	},
	delivery_charges: {
		type: Sequelize.TEXT
	},
	gtag_tracking_id: {
		type: Sequelize.TEXT
	},
	brands: {
		type: Sequelize.TEXT
	}
},{
	underscored: true
});

module.exports = RestaurantWebsiteDetail;