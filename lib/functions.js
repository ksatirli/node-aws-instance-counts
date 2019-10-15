const _ = require('lodash')
const AWS = require('aws-sdk')
const chalk = require('chalk')

const getEc2InstanceData = (payload, cb) => {
  AWS.config.update({
    accessKeyId: payload.credentials.accessKey,
    secretAccessKey: payload.credentials.secretAccessKey,
    region: payload.credentials.region
  })

  const ec2 = new AWS.EC2()

  ec2.describeInstances(payload.ec2Params, function (err, data) {
    if (err) {
      cb(err)
    } else {
      payload.instanceData = data
      cb(null, payload)
    }
  })
}

const getEc2InstanceCounts = (payload, cb) => {
  if (typeof payload.instanceData.Reservations === 'undefined') {
    cb(new Error('Payload is not as expected.'))
  } else {
    // transform data
    let data = []

    // iterate over reservations
    _.forEach(payload.instanceData.Reservations, value => {
      // iterate over (actual) instances
      _.forEach(value.Instances, instanceValue => {
        let instanceType = instanceValue.InstanceType
        let instanceState = instanceValue.State.Name

        // pretty-print information per instance, if debug mode is enabled
        if (payload.debug) {
          instanceState = (instanceState === 'running' ? chalk.green('running') : chalk.red(instanceState))
          console.log('Instance Type:   ', chalk.white(instanceType))
          console.log('Instance State:  ', instanceState)
          console.log()
        }

        // set initial counts to zero
        if (typeof data[instanceType] === 'undefined') {
          data[instanceType] = {
            active: 0,
            inactive: 0
          }
        }

        // increase counts
        if (instanceState === 'running') {
          data[instanceType].active++
        } else {
          data[instanceType].inactive++
        }
      })
    })

    payload.instanceDataClean = data

    cb(null, payload)
  }
}

const getRdsInstanceData = (payload, cb) => {
  AWS.config.update({
    accessKeyId: payload.credentials.accessKey,
    secretAccessKey: payload.credentials.secretAccessKey,
    region: payload.credentials.region
  })

  var rds = new AWS.RDS()

  rds.describeDBInstances(payload.rdsParams, function (err, data) {
    if (err) {
      cb(err)
    } else {
      payload.instanceData = data
      cb(null, payload)
    }
  })
}

const getRdsInstanceCounts = (payload, cb) => {
  if (typeof payload.instanceData.DBInstances === 'undefined') {
    cb(new Error('Payload is not as expected.'))
  } else {
    // transform data
    let data = []

    // iterate over reservations
    _.forEach(payload.instanceData.DBInstances, function (value) {
      let instanceType = value.DBInstanceClass
      let instanceState = value.DBInstanceStatus

      // pretty-print information per instance, if debug mode is enabled
      if (payload.debug) {
        instanceState = (instanceState === 'available' ? chalk.green('running') : chalk.red(instanceState))
        console.log('Instance Type:   ', chalk.white(instanceType))
        console.log('Instance State:  ', instanceState)
        console.log()
      }

      // set initial counts to zero
      if (typeof data[instanceType] === 'undefined') {
        data[instanceType] = {
          active: 0,
          inactive: 0
        }
      }

      // increase counts
      if (instanceState === 'available') {
        data[instanceType].active++
      } else {
        data[instanceType].inactive++
      }
    })

    payload.instanceDataClean = data

    cb(null, payload)
  }
}

const prettyPrintInstanceCounts = (payload, cb) => {
  // iterate over (actual) instances
  _.forEach(Object.keys(payload.instanceDataClean), function (instanceType) {
    console.log()
    console.log(chalk.white(instanceType))
    console.log(chalk.green('  active:    ', payload.instanceDataClean[instanceType].active))
    console.log(chalk.red('  inactive:  ', payload.instanceDataClean[instanceType].inactive))
    console.log()
  })

  cb(null)
}

module.exports = {
  getEc2InstanceData: getEc2InstanceData,
  getEc2InstanceCounts: getEc2InstanceCounts,
  getRdsInstanceData: getRdsInstanceData,
  getRdsInstanceCounts: getRdsInstanceCounts,
  prettyPrintInstanceCounts: prettyPrintInstanceCounts
}
