const express = require("express");
var router = express.Router();
const { dunzoController } = require("./../../controllers/before_login");

// var constants = require('./../../config/constants');
// var _ = require('underscore');
router.get('/dunzo/task_status', dunzoController.handleTaskStatusWebhook);

module.exports = router;
