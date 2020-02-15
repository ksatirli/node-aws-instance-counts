const async = require('async')
const chalk = require('chalk')
const lib = require('./lib/functions')
const env = process.env

const opts = {
  debug: env.DEBUG || false,
  target: env.TARGET || 'ec2',
  accessKey: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION
}

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
      console.log('AWS Access Key:            ', chalk.white.underline(opts.accessKey))
      console.log('AWS Secret Access Key:     ', chalk.white.underline(opts.secretAccessKey))
      console.log('AWS Region:                ', chalk.white.underline(opts.region))
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
    console.error(chalk.red('An error occurred while attempting to retrieve data from AWS:'))
    console.error(chalk.red(err))
    process.exit(1)
  } else {
    process.exit(0)
  }
})
