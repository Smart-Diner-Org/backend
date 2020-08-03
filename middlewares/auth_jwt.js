const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
// const dbModels = require("../models");
const Customer = require("../models/Customer");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.customerId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
     customer.getRole().then(role => {
        if (role.name === "Admin") {
          next();
          return;
        }

      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

isSuperAdmin = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      console.log(role);
      if (role.name === "Super Admin") {
        next();
        return;
      }

      res.status(403).send({
        message: "Require Super Admin Role!"
      });
    });
  });
};

isCustomer = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Customer") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Customer Role!"
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isSuperAdmin: isSuperAdmin,
  isCustomer: isCustomer
};
module.exports = authJwt;
