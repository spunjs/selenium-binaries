'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var async = require('async');
var cli = require('./cli');
var config = require('./config');
var driverUtils = require('./driver-utils');
var configureIe = require('./configure-ie');

Object.keys(config.binaries).forEach(function (resource) {
  mkdirp.sync(config.binaries[resource].binary.path);
});

var tasks = [
  driverUtils.ensureDriver.bind(null, 'seleniumserver'),

  driverUtils.ensureDriver.bind(null, 'chromedriver'),
  driverUtils.decompressArchive.bind(null, 'chromedriver'),

  driverUtils.ensureDriver.bind(null, 'geckodriver'),
  driverUtils.decompressArchive.bind(null, 'geckodriver')
];

if(config.isWin){
  tasks.push(driverUtils.ensureDriver.bind(null, 'iedriver'));
  tasks.push(driverUtils.decompressArchive.bind(null, 'iedriver'));
  tasks.push(function (cb) {
    configureIe(cb);
  });
}

async.series(tasks, function(err, taskResults) {
  var binaries;

  if (err) {
    cli.err('The following error occurred:');
    cli.err(err);
    return cli.exit(1);
  }

  binaries = {
    home: process.env.SELENIUM_BINARIES_HOME
  };

  for (var i = 0; i < taskResults.length; i++) {
    var taskResult = taskResults[i];
    if (taskResult && taskResult.driverName) {
      binaries[taskResult.driverName] = taskResult.driverPath;
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'binary-paths.json'),
    JSON.stringify(binaries, null, '  ')
  );
});
