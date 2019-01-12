'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var download = require('download');
var cli = require('./cli');
var config = require('./config');

function getDriverPathTaskResult(driverName) {
  var driverConfig = config.binaries[driverName];

  return {
    driverName: driverName,
    driverPath: path.resolve(driverConfig.path, driverConfig.binaryName)
  };
}

function findDriver(driverConfig) {
  var driverPath = path.resolve(driverConfig.path, driverConfig.binaryName);

  try {
    fs.accessSync(driverPath);
  } catch (e) {
    return false;
  }

  return driverPath;
}

function downloadDriver(driverConfig, cb) {
  var downloadUrl = driverConfig.url + driverConfig.archiveName;

  // Only extract .zip or .gz files -- not .jar or others
  var archiveType = path.extname(driverConfig.archiveName);
  var shouldExtract = ['.zip', '.gz'].indexOf(archiveType) !== -1;

  cli.log('Downloading ' + driverConfig.archiveName);
  cli.log(downloadUrl);
  cli.log(' -> ' + driverConfig.path + '\n');

  var request = download(downloadUrl, driverConfig.path, {
    extract: shouldExtract
  });

  request.on('error', function (err) {
    cb(new Error(err));
  });

  request.on('downloadProgress', function (progress) {
    cli.clearLog('Status: ' + progress.transferred + ' of ' + progress.total);
  });

  request.then(function () {
    cli.log('Finished downloading ' + downloadUrl + '\n');
    cb();
  });
}

module.exports = function (driverName, cb) {
  var driverConfig = config.binaries[driverName];
  var driverFoundPath = findDriver(driverConfig);

  if (driverFoundPath) {
    cli.log('Found ' + driverName + ' at ' + driverFoundPath + '\n');
    cb(null, getDriverPathTaskResult(driverName));
    return;
  }

  mkdirp.sync(driverConfig.path);

  var tasks = [
    downloadDriver.bind(null, driverConfig),
  ];

  async.series(tasks, function (err) {
    if (err) {
      cb(err);
    } else {
      cb(null, getDriverPathTaskResult(driverName));
    }
  });
};