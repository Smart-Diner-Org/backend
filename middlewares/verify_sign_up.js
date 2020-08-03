const models = require("../models");
const Role = models.Role;
const Customer = models.Customer;
var helper = require('./../helpers/general_helper');


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
    Customer.findOne({
      where: {
        mobile: req.body.email
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
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
