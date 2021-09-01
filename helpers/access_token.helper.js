const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");

module.exports.getJwtAccessToken = (id, application=null) => {
	if(application === 'app'){
		return jwt.sign({ id: id }, config.secret);
	}
	else{
		return jwt.sign({ id: id }, config.secret, {
			expiresIn: 86400 // 24 hours
		});
	}
}