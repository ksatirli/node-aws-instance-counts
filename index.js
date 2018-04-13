const async = require('async')
const chalk = require('chalk')
const lib = require('./lib/functions')
const env = process.env
const red = chalk.red
const underline = chalk.white.underline

let opts = {
  debug: false, // set this by passing `--debug="true"`
  target: 'ec2', // set this by passing `--target="rds"`
  accessKey: null,
  secretAccessKey: null,
  region: null,
  AWS_ACCESS_KEY: null,
  AWS_SECRET_ACCESS_KEY: null,
  AWS_REGION: null
}

// assigning cli option
var argv = require('minimist')(process.argv.slice(2))
opts = Object.assign(argv, opts)

if (!opts.AWS_ACCESS_KEY || !opts.AWS_SECRET_ACCESS_KEY || !opts.AWS_REGION) {
  if (!env.AWS_ACCESS_KEY || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION) {
    console.error(red('Unable to fetch AWS access credentials and region from environment or CLI arguments.'))
  } else {
    opts = Object.assign(env, argv)
  }
}

opts.accessKey = opts.AWS_ACCESS_KEY
opts.secretAccessKey = opts.AWS_SECRET_ACCESS_KEY
opts.region = opts.AWS_REGION

// fetch instances

async.waterfall([
  cb => {
    // add goodness to payload
    const payload = {
      credentials: {
        accessKey: opts.accessKey,
        secretAccessKey: opts.secretAccessKey,
        region: opts.region
      },
      ec2Params: {},
      rdsParams: {},
      debug: opts.debug,
      target: opts.target
    }

    // pretty-print AWS access credentials, if debug mode is enabled
    if (payload.debug) {
      console.log()
      console.log('------------------------------------------------------------------------')
      console.log('AWS Access Key:            ', underline(opts.accessKey))
      console.log('AWS Secret Access Key:     ', underline(opts.secretAccessKey))
      console.log('AWS Region:                ', underline(opts.region))
      console.log('------------------------------------------------------------------------')
      console.log()
    }

    cb(null, payload)
  },

  // switch between EC2 and RDS
  (payload, cb) => {
    if (opts.target === 'ec2') {
      lib.getEc2InstanceData(payload, cb)
    } else if (opts.target === 'rds') {
      lib.getRdsInstanceData(payload, cb)
    } else {
      cb(new Error('Target is not supported.'))
    }
  },

  // switch between EC2 and RDS
  (payload, cb) => {
    if (opts.target === 'ec2') {
      lib.getEc2InstanceCounts(payload, cb)
    } else if (opts.target === 'rds') {
      lib.getRdsInstanceCounts(payload, cb)
    } else {
      cb(new Error('Target is not supported.'))
    }
  },

  // printing nicely
  lib.prettyPrintInstanceCounts
],
// optional callback
(err, results) => {
  if (err) {
    console.error(red('An error occurred while attempting to retrieve data from AWS:'))
    console.error(red(err))
    process.exit(1)
  } else {
    void results
    process.exit(0)
  }
})
