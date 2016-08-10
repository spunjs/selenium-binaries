'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var rimraf = require('rimraf');
var cli = require('./cli');
var config = require('./config');
var initDriver = require('./init-driver');
var configureIe = require('./configure-ie');

try {
  // reset drivers if any critical config has changed (such as arch version).
  var lastConfig = require('../last-config.json');
  if (lastConfig.is64 !== config.is64 || lastConfig.isWin !== config.isWin) {
    rimraf.sync(config.binariesPath);
  }
} catch (e) {
  // cannot locate last-config.json, nothing to do.
}

var tasks = [
  initDriver.bind(null, 'seleniumserver'),
  initDriver.bind(null, 'chromedriver'),
  initDriver.bind(null, 'geckodriver')
];

if (config.isWin) {
  tasks.push(
    initDriver.bind(null, 'iedriver'),
    configureIe.bind(null)
  );
}

async.series(tasks, function (err, taskResults) {
  var binaries;

  if (err) {
    cli.err('The following error occurred:');
    cli.err(err);
    cli.exit(1);
    return;
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
    path.resolve(__dirname, '..', 'last-config.json'),
    JSON.stringify(config, null, '  ')
  );

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'binary-paths.json'),
    JSON.stringify(binaries, null, '  ')
  );
});
