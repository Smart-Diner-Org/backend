const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
// const dbModels = require("../models");
const Customer = require("../models/Customer");
var constants = require('./../config/constants');

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
      return res.status(403).send({
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

isSmartDinerSuperAdmin = (req, res) => {
  console.log("going into Smart Diner Super Admin");
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Smart Diner Super Admin"){
         console.log("returning true - Smart Diner Super Admin");
        return true;
      }
      else return false;
    });
  });
}

isAdminOrSuperAdmin = (req, res) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Admin" || role.name === "Super Admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Admin or Super Admin Role!"
      });
    });
  });
}

canAccessRestaurantDetails = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Admin" || role.name === "Super Admin" || role.name === "Smart Diner Super Admin") {
        next();
        return;
      }
      return res.status(403).send({
        message: "Required proper role to access. You are not allowed to access."
      });
    });
  });
};

canAccessAllRestaurants = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    if (parseInt(customer.role_id) === constants.roles.smartDinerSuperAdmin) {
      next();
      return;
    }
    return res.status(403).send({
      message: "Required proper role to access. You are not allowed to access."
    });
  });
};

canAssignDelivery = (req, res, next) => {
  isAdminOrSuperAdmin(req, res, next);
};

canGetInvoice = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Admin" || role.name === "Super Admin" || role.name === "Smart Diner Super Admin") {
        next();
        return;
      }
      return res.status(403).send({
        message: "Required proper role to access. You are not allowed to access."
      });
    });
  });
};

canUpdateDeliveryStage = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Delivery Partner Admin" || role.name === "Admin" || role.name === "Super Admin" || role.name === "Smart Diner Super Admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Required Proper Role!"
      });
    });
  });
};

isDeliveryPartner = (req, res, next) => {
  Customer.findByPk(req.customerId).then(customer => {
    customer.getRole().then(role => {
      if (role.name === "Delivery Partner Admin") {
        next();
        return;
      }
      res.status(403).send({
        message: "Require Delivery Partner Admin Role!"
      });
    });
  });
}

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isSuperAdmin: isSuperAdmin,
  isCustomer: isCustomer,
  canAccessRestaurantDetails: canAccessRestaurantDetails,
  canAccessAllRestaurants: canAccessAllRestaurants,
  isAdminOrSuperAdmin: isAdminOrSuperAdmin,
  canAssignDelivery: canAssignDelivery,
  canUpdateDeliveryStage: canUpdateDeliveryStage,
  isDeliveryPartner: isDeliveryPartner,
  canGetInvoice: canGetInvoice
};
module.exports = authJwt;
