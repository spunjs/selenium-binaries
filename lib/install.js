'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var async = require('async');
var resolve = path.resolve;
var cli = require('./cli');
var driverInit = require('./driver-init');
var configureIe = require('./configure-ie');
var config = require('./config');

Object.keys(config.binaries)
    .forEach(function(resource){
      var path = config.binaries[resource].binary.path;
      mkdirp.sync(path);
    });

var tasks = [
  driverInit.ensureDriver.bind(this, 'seleniumserver'),

  driverInit.ensureDriver.bind(this, 'chromedriver'),
  driverInit.unzipDriver.bind(this, 'chromedriver'),

  driverInit.ensureDriver.bind(this, 'firefoxdriver'),
  driverInit.unzipDriver.bind(this, 'firefoxdriver')
];

if(config.isWin){
  tasks.push(driverInit.ensureDriver.bind(this, 'iedriver'));
  tasks.push(driverInit.unzipDriver.bind(this, 'iedriver'));

  tasks.push(function(cb){
    configureIe(cb);
  });
}

async.series(tasks, function(err, taskResults){
  var binaries;

  if(err){
    cli.err('The following error occurred:');
    cli.err(err);
    return cli.exit(1);
  }

  binaries = {
    home: process.env.SELENIUM_BINARIES_HOME
  };

  for (var i = 0; i < taskResults.length; i++)
  {
    var taskResult = taskResults[i];
    if (taskResult && taskResult.driverName)
    {
      binaries[taskResult.driverName] = taskResult.driverPath;
    }
  }

  fs.writeFileSync(
    resolve(__dirname, '..', 'binary-paths.json'),
    JSON.stringify(binaries, null, '  ')
  );
});
