'use strict';

var _ = require('lodash');
var AWS = require('aws-sdk');
var chalk = require('chalk');

var getEc2InstanceData = function(payload, callback) {

  AWS.config.update({
    accessKeyId: payload.credentials.accessKey,
    secretAccessKey: payload.credentials.secretAccessKey,
    region: payload.credentials.region
  });

  var ec2 = new AWS.EC2();

  ec2.describeInstances(payload.ec2Params, function(err, data) {
    if (err) {
      callback(err);
    } else {
      payload.instanceData = data;

      callback(null, payload);
    }
  });
};

var getEc2InstanceCounts = function(payload, callback) {
  if (typeof payload.instanceData.Reservations === 'undefined') {
    callback('Payload is not as expected.');
  } else {
    // transform data
    var data = [];

    // iterate over reservations
    _.forEach(payload.instanceData.Reservations, function(value) {

      // iterate over (actual) instances
      _.forEach(value.Instances, function(instanceValue) {
        var instanceType = instanceValue.InstanceType;
        var instanceState = instanceValue.State.Name;

        // pretty-print information per instance, if debug mode is enabled
        if (payload.debug) {
          instanceState = (instanceState === 'running' ? chalk.green('running') : chalk.red(instanceState));
          console.log('Instance Type:   ', chalk.white(instanceType));
          console.log('Instance State:  ', instanceState);
          console.log();
        }

        // set initial counts to zero
        if (typeof data[instanceType] === 'undefined') {
          data[instanceType] = {
            active: 0,
            inactive: 0
          };
        }

        // increase counts
        if (instanceState === 'running') {
          data[instanceType].active++;
        } else {
          data[instanceType].inactive++;
        }
      });
    });

    payload.instanceDataClean = data;

    callback(null, payload);
  }
};

var getRdsInstanceData = function(payload, callback) {

  AWS.config.update({
    accessKeyId: payload.credentials.accessKey,
    secretAccessKey: payload.credentials.secretAccessKey,
    region: payload.credentials.region
  });

  var rds = new AWS.RDS();

  rds.describeDBInstances(payload.rdsParams, function(err, data) {
    if (err) {
      callback(err);
    } else {
      payload.instanceData = data;

      callback(null, payload);
    }
  });
};

var getRdsInstanceCounts = function(payload, callback) {
  if (typeof payload.instanceData.DBInstances === 'undefined') {
    callback('Payload is not as expected.');
  } else {
    // transform data
    var data = [];

    // iterate over reservations
    _.forEach(payload.instanceData.DBInstances, function(value) {

      var instanceType = value.DBInstanceClass;
      var instanceState = value.DBInstanceStatus;

      // pretty-print information per instance, if debug mode is enabled
      if (payload.debug) {
        instanceState = (instanceState === 'available' ? chalk.green('running') : chalk.red(instanceState));
        console.log('Instance Type:   ', chalk.white(instanceType));
        console.log('Instance State:  ', instanceState);
        console.log();
      }

      // set initial counts to zero
      if (typeof data[instanceType] === 'undefined') {
        data[instanceType] = {
          active: 0,
          inactive: 0
        };
      }

      // increase counts
      if (instanceState === 'available') {
        data[instanceType].active++;
      } else {
        data[instanceType].inactive++;
      }
    });

    payload.instanceDataClean = data;

    callback(null, payload);
  }
};

var prettyPrintInstanceCounts = function(payload, callback) {
  // iterate over (actual) instances
  _.forEach(Object.keys(payload.instanceDataClean), function(instanceType) {

    console.log();
    console.log(chalk.white(instanceType));
    console.log(chalk.green('  active:    ', payload.instanceDataClean[instanceType].active));
    console.log(chalk.red('  inactive:  ', payload.instanceDataClean[instanceType].inactive));
    console.log();
  });

  callback(null);
};

module.exports = {
  getEc2InstanceData: getEc2InstanceData,
  getEc2InstanceCounts: getEc2InstanceCounts,
  getRdsInstanceData: getRdsInstanceData,
  getRdsInstanceCounts: getRdsInstanceCounts,
  prettyPrintInstanceCounts: prettyPrintInstanceCounts
};
