const express = require("express");
var indexRouter = require('./index');
var settingsDoNot_TouchRouter = require('./settings_do_not_touch');
var beforeLoginAPIRouter = require("./before_login/start");
var afterLoginAPIRouter = require("./after_login/start");
var authAPIRouter = require("./auth.routes");
var userAPIRouter = require("./user.routes");


module.exports = function(app) {
	app.use(express.json());

	app.use('/', indexRouter);
	// app.use('/settings', settingsDoNot_TouchRouter);
	app.use('/before_login', beforeLoginAPIRouter);
	app.use('/after_login', afterLoginAPIRouter);
	app.use('/auth', authAPIRouter);
	app.use('/usertest', userAPIRouter);
};