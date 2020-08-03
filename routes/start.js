const express = require("express");
var indexRouter = require('./index');
var usersRouter = require('./users');
var testAPIRouter = require("./testAPI");
var beforeLoginAPIRouter = require("./before_login/start");
var authAPIRouter = require("./auth.routes");
var userAPIRouter = require("./user.routes");


module.exports = function(app) {
	app.use(express.json());

	app.use('/', indexRouter);
	app.use('/users', usersRouter);
	app.use('/testAPI', testAPIRouter);
	app.use('/before_login', beforeLoginAPIRouter);
	app.use('/auth', authAPIRouter);
	app.use('/usertest', userAPIRouter);
};