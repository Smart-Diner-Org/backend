const Customer = require("../models/Customer");
const CustomerDetail = require("../models/CustomerDetail");
var State = require('../models/State');
var City = require('../models/City');
const Role = require("../models/Role");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var helper = require('./../helpers/general.helper');
var smsHelper = require('./../helpers/sms.helper');
var accessTokenHelper = require('./../helpers/access_token.helper');
var bcrypt = require("bcryptjs");
const SendOtp = require('sendotp');
const sendOtp = new SendOtp(process.env.OTP_API_KEY);
var express = require('express');
var app = express();

exports.checkAccount= (req, res) => {
  Customer.findOne({
    where: {
      mobile: req.body.mobile
    }
  })
  .then(user => {
    if (!user) {
      // Should go to signup route
      req.url = '/auth/signup';
    }
    else{
      // Should go to signin route
      req.url = '/auth/signin';
    }
    return req.app._router.handle(req, res);
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
}

exports.signup = (req, res) => {
  // Save User to Database
  var dataToSave = {
    name: req.body.name,
    mobile: req.body.mobile,
    role_id: req.body.role_id,
  };
  // if(helper.isEmailLoginRole(req.body.roleId)){
    dataToSave['email'] = req.body.email;
    if(dataToSave['password'])
      dataToSave['password'] = bcrypt.hashSync(req.body.password, 8);
  // }

  console.log(dataToSave);

  Customer.create(dataToSave)
    .then(user => {
      //Trigger OTP to verify the mobile number
      smsHelper.triggerOtp(user.mobile, function(smsStatus){
        if(smsStatus){
          return res.status(200).send({ message: "Successfully triggered OTP." });
        }
        else res.status(500).send({ message: "Could not trigger OTP. Please try again." });
      });

      // res.send({ message: "User was registered successfully!" });

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
  if(req.body.email){
    Customer.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
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
      var token = accessTokenHelper.getJwtAccessToken(user.id);
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
        return res.status(404).send({ message: "User not found." });
      }
      smsHelper.triggerOtp(user.mobile, function(smsStatus){
        if(smsStatus){
          return res.status(200).send({ message: "Successfully trigger OTP." });
        }
        else res.status(500).send({ message: "Could not trigger OTP. Please try again." });
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

exports.verifyOtp = (req, res) => {
  console.log("Here 1");
  Customer.findOne({
      where: {
        mobile: req.body.mobile
      },
      include:[
        { model: CustomerDetail, as: 'customer_detail', required: false,
          include: [
            { model: City, as: 'city' },
            { model: State, as: 'state' }
          ]
        }
      ]
    })
    .then(user => {
      console.log("Here 2");
      console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      console.log("Here 3");
      // res.status(200).send({
      //   user: user
      // });
      smsHelper.verifyOtp(user.mobile, req.body.otp, function(smsStatus, message){
        if(smsStatus){

          if(!user.mobile_verification){
            user.update({'mobile_verification': true});
          }

          var token = accessTokenHelper.getJwtAccessToken(user.id);
          res.status(200).send({
            user: user,
            accessToken: token
          });
          // res.status(200).send({
          //   id: user.id,
          //   name: user.name,
          //   mobile: user.mobile,
          //   accessToken: token
          // });
        }
        else res.status(500).send({ message: message });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.resendOtp = (req, res) => {
  Customer.findOne({
      where: {
        mobile: req.body.mobile
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      var retryVoice = false;
      smsHelper.resendOtp(user.mobile, retryVoice, function(smsStatus, message){
        if(smsStatus){
          return res.status(200).send({ message: "Successfully retriggered OTP." });
        }
        else res.status(500).send({ message: message });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
