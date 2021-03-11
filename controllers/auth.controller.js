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
var constants = require('../config/constants');
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

exports.signup = (req, res, next = null) => {
  console.log('inside signup');
  var dataToSave = {
    name: req.body.name,
    mobile: req.body.mobile,
    role_id: req.body.roleId,
  };
  dataToSave['email'] = req.body.email;
  if(req.body.password)
    dataToSave['password'] = bcrypt.hashSync(req.body.password, 8);

  console.log("inside sign up 1");

  Customer.create(dataToSave)
    .then(user => {
      //Trigger OTP to verify the mobile number
      smsHelper.triggerOtp(user.mobile, constants.countryDialCode.india, function(smsStatus){
        if(smsStatus){
          if(req.isfromManualRestaurantSetup){
            req.hasAccountCreated = true;
            req.createdCustomerId = user.id;
            next();
          }
          else
            return res.status(200).send({ message: "Successfully triggered OTP." });
        }
        else res.status(500).send({ message: "Could not trigger OTP. Please try again." });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  if(req.body.email && !req.body.mobile){
    if(!req.body.password)
      return res.status(404).send({ message: "Password is missing." });
    Customer.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      if(!helper.isEmailLoginRole(user.role_id)){
        return res.status(404).send({ message: "Could not login with password" });
      }
      var passwordIsValid = false;
      if(user.password)
        passwordIsValid = bcrypt.compareSync(
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
        message: 'Login Success!',
        id: user.id,
        username: user.name,
        email: user.email,
        accessToken: token,
        roleId: user.role_id
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
      smsHelper.triggerOtp(user.mobile, constants.countryDialCode.india, function(smsStatus){
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
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      smsHelper.verifyOtp(user.mobile, constants.countryDialCode.india, req.body.otp, function(smsStatus, message){
        if(smsStatus){

          if(!user.mobile_verification){
            user.update({'mobile_verification': true});
          }

          var token = accessTokenHelper.getJwtAccessToken(user.id);
          res.status(200).send({
            customer: user,
            accessToken: token
          });
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
      smsHelper.resendOtp(user.mobile, constants.countryDialCode.india, retryVoice, function(smsStatus, message){
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
