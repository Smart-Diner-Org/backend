const express = require("express");
var indexRouter = require('./index');
var usersRouter = require('./users');
var testAPIRouter = require("./testAPI");
var beforeLoginAPIRouter = require("./before_login/start");

module.exports = function(app) {
	app.use(express.json());

	app.use('/', indexRouter);
	app.use('/users', usersRouter);
	app.use('/testAPI', testAPIRouter);
	app.use('/before_login', beforeLoginAPIRouter);
};