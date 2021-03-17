// const models = require("../models");
const Role = require("../models/Role");
const Customer = require("../models/Customer");
var helper = require('./../helpers/general.helper');

checkForMobileAndRole = (req, res, next) => {
  if(!req.body.roleId){
    return res.status(404).send({ message: "Rold id is missing" });
  }
  if(!req.body.mobile){
    return res.status(404).send({ message: "Mobile number is missing" });
  }
  next();
};

checkForMobileAndOtp = (req, res, next) => {
  if(!req.body.otp){
    return res.status(404).send({ message: "OTP id is missing" });
  }
  if(!req.body.mobile){
    return res.status(404).send({ message: "Mobile number is missing" });
  }
  next();
};

checkForMobile = (req, res, next) => {
  if(!req.body.mobile){
    return res.status(404).send({ message: "Mobile number is missing" });
  }
  next();
};

checkForEmail = (req, res, next) => {
  if(!req.body.email){
    return res.status(404).send({ message: "Email id is missing" });
  }
  next();
};

checkDuplicateMobile = (req, res, next) => {
  Customer.findOne({
    where: {
      mobile: req.body.mobile
    }
  }).then(customer => {
    if (customer) {
      res.status(400).send({
        message: "Failed! Mobile number is already in use!"
      });
      return;
    }
    next();
  });
}

checkDuplicateMobileOrEmail = (req, res, next) => {
  // Mobile number
  if(helper.isMobileLoginRole(req.body.roleId)){
    Customer.findOne({
      where: {
        mobile: req.body.mobile
      }
    }).then(customer => {
      if (customer) {
        res.status(400).send({
          message: "Failed! Mobile number is already in use!"
        });
        return;
      }
      next();
    });
  }
  else{
    if(req.body.email){
      Customer.findOne({
        where: {
          email: req.body.email
        }
      }).then(customer => {
        if (customer) {
          res.status(400).send({
            message: "Failed! Email is already in use!"
          });
          return;
        }
        next();
      });
    }
    else {
      res.status(400).send({
        message: "Email id missing"
      });
      return;
    }
  }
  // User.findOne({
  //   where: {
  //     username: req.body.username
  //   }
  // }).then(user => {
  //   if (user) {
  //     res.status(400).send({
  //       message: "Failed! Username is already in use!"
  //     });
  //     return;
  //   }

  //   // Email
  //   User.findOne({
  //     where: {
  //       email: req.body.email
  //     }
  //   }).then(user => {
  //     if (user) {
  //       res.status(400).send({
  //         message: "Failed! Email is already in use!"
  //       });
  //       return;
  //     }

  //     next();
  //   });
  // });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!Role.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateMobileOrEmail: checkDuplicateMobileOrEmail,
  checkRolesExisted: checkRolesExisted,
  checkForMobileAndRole: checkForMobileAndRole,
  checkForMobileAndOtp: checkForMobileAndOtp,
  checkForMobile: checkForMobile,
  checkForEmail: checkForEmail,
  checkDuplicateMobile: checkDuplicateMobile
};

module.exports = verifySignUp;
