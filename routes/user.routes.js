const express = require("express");
var router = express.Router();
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");


router.get("/all", controller.allAccess);

router.get(
  "/user",
  [authJwt.verifyToken, authJwt.isCustomer],
  controller.userBoard
);

router.get(
  "/superadmin",
  [authJwt.verifyToken, authJwt.isSuperAdmin],
  controller.superAdminBoard
);

router.get(
  "/admin",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.adminBoard
);
module.exports = router;
