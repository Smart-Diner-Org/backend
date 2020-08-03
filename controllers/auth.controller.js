// const dbModels = require("../models");
const config = require("../config/auth.config");
const Customer = require("../models/Customer");
const Role = require("../models/Role");
// const Customer = dbModels.Customer;
// const Role = dbModels.Role;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var helper = require('./../helpers/general_helper');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  var dataToSave = {
    name: req.body.name,
    mobile: req.body.mobile,
    role_id: req.body.role_id,
  };
  // if(helper.isEmailLoginRole(req.body.roleId)){
    dataToSave['email'] = req.body.email;
    dataToSave['password'] = bcrypt.hashSync(req.body.password, 8);
  // }

  console.log(dataToSave);

  Customer.create(dataToSave)
    .then(user => {
      res.send({ message: "User was registered successfully!" });
      /*if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }*/
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  // if(helper.isEmailLoginRole(req.body.roleId)){}
  if(req.body.email){
    Customer.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
  }
  else if(req.body.mobile){
    Customer.findOne({
      where: {
        mobile: req.body.mobile
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      //Write code to trigger OTP to mobile and save it in DB
      user.update({
        otp: '123456'
      })
      .then(() => {
        return res.status(200).send({ message: "Successfully trigger OTP." });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
  }
  else{
    res.status(500).send({ message: 'Parameter Missing' });
  }
};

exports.signinViaOtp = (req, res) => {
  Customer.findOne({
      where: {
        mobile: req.body.mobile
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var otpIsValid = false;
      if(user.otp === req.body.otp)
        otpIsValid = true;

      if (!otpIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid OTP!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      res.status(200).send({
        id: user.id,
        username: user.username,
        mobile: user.mobile,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
