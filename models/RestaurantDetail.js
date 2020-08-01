const Sequelize = require('sequelize');
var db = require('./../config/database');
// var RestaurantDetail = require('./RestaurantDetail')

const RestaurantDetail = db.define('restaurant_details', {
	restaurant_id: {
		type: Sequelize.BIGINT
	},
	facebook_link: {
		type: Sequelize.CHAR
	},
	instagram_link: {
		type: Sequelize.CHAR
	},
	youtube_link: {
		type: Sequelize.CHAR
	},
	twitter_link: {
		type: Sequelize.CHAR
	},
	linkedin_link: {
		type: Sequelize.CHAR
	}
},{
	underscored: true
});

module.exports = RestaurantDetail;