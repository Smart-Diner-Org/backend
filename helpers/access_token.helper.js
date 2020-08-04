const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");

module.exports.getJwtAccessToken = (id) => {
	return jwt.sign({ id: id }, config.secret, {
		expiresIn: 86400 // 24 hours
	});
}