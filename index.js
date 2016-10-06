'use strict';

var debug = false; // set this by passing `--debug="true"`
var target = 'ec2'; // set this by passing `--target="rds"`
var accessKey = null;
var secretAccessKey = null;
var region = null;

var async = require('async');
var chalk = require('chalk');

// parse argv
var argv = require('minimist')(process.argv.slice(2));

// toggle debug mode
if (argv.debug === 'true') {
  debug = true;
}

// toggle debug mode
if (argv.target === 'rds') {
  target = 'rds';
}

// check if access credentials have been passed as arguments
if (typeof argv.AWS_ACCESS_KEY === 'undefined' ||
    typeof argv.AWS_SECRET_ACCESS_KEY === 'undefined' ||
    typeof argv.AWS_REGION === 'undefined') {

  // check if access credentials are available through environment
  if (typeof process.env.AWS_ACCESS_KEY === 'undefined' ||
      typeof process.env.AWS_SECRET_ACCESS_KEY === 'undefined' ||
      typeof process.env.AWS_REGION === 'undefined') {
    console.error(chalk.red('Unable to fetch AWS access credentials and region from environment or CLI arguments.'));

    process.exit(1);
  } else {
    console.log(chalk.dim('Setting AWS access credentials and region from environment variables'));

    accessKey = process.env.AWS_ACCESS_KEY;
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    region = process.env.AWS_REGION;
  }
} else {
  console.log(chalk.dim('Setting AWS access credentials from CLI arguments'));

  accessKey = argv.AWS_ACCESS_KEY;
  secretAccessKey = argv.AWS_SECRET_ACCESS_KEY;
  region = argv.AWS_REGION;
}

// fetch instances
var lib = require('./lib/functions');

async.waterfall([
  function(callback) {
    // add goodness to payload
    var payload = {
      credentials: {
        accessKey: accessKey,
        secretAccessKey: secretAccessKey,
        region: region
      },

      ec2Params: {},

      rdsParams: {},

      debug: debug,

      target: target
    };

    // pretty-print AWS access credentials, if debug mode is enabled
    if (payload.debug) {
      console.log();
      console.log('------------------------------------------------------------------------');
      console.log('AWS Access Key:            ', chalk.white.underline(accessKey));
      console.log('AWS Secret Access Key:     ', chalk.white.underline(secretAccessKey));
      console.log('AWS Region:                ', chalk.white.underline(region));
      console.log('------------------------------------------------------------------------');
      console.log();
    }

    callback(null, payload);
  },

  // switch between EC2 and RDS
  function(payload, callback) {
    if (target === 'ec2') {
      lib.getEc2InstanceData(payload, callback);
    } else if (target === 'rds') {
      lib.getRdsInstanceData(payload, callback);
    } else {
      callback('Target is not supported.');
    }
  },

  // switch between EC2 and RDS
  function(payload, callback) {
    if (target === 'ec2') {
      lib.getEc2InstanceCounts(payload, callback);
    } else if (target === 'rds') {
      lib.getRdsInstanceCounts(payload, callback);
    } else {
      callback('Target is not supported.');
    }
  },

  lib.prettyPrintInstanceCounts
],
// optional callback
function(err, results) {
  if (err) {
    console.error(chalk.red('An error occurred while attempting to retrieve data from AWS:'));
    console.error(chalk.red(err));

    process.exit(1);
  } else {
    void results;

    process.exit(0);
  }
});
