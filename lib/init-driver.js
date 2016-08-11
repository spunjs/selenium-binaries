'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var targz = require('tar.gz');
var unzip = require('unzip');
var download = require('download');
var cli = require('./cli');
var config = require('./config');

var READ_MODE = parseInt('666', 8);
var EXEC_MODE = parseInt('755', 8);

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
  var contentLength;
  var amountDownloaded = 0;

  cli.log('Downloading ' + driverConfig.archiveName);
  cli.log(downloadUrl);
  cli.log(' -> ' + driverConfig.path + '\n');

  var request = download(downloadUrl, driverConfig.path, {mode: READ_MODE});

  request.on('response', function (res) {
    contentLength = parseInt(res.headers['content-length']);
  });

  request.on('error', function (err) {
    cb(new Error(err));
  });

  request.on('data', function (data) {
    amountDownloaded += data.length;
    cli.clearLog('Status: ' + amountDownloaded + ' of ' + contentLength);
  });

  request.on('close', function () {
    cli.log('Finished downloading ' + downloadUrl + '\n');
    cb();
  });
}

function decompressArchive(driverConfig, cb) {
  var archiveType = path.extname(driverConfig.archiveName);

  if (['.zip', '.gz'].indexOf(archiveType) === -1) {
    cb();
    return;
  }

  var archivePath = path.resolve(driverConfig.path, driverConfig.archiveName);
  var inputArchiveStream = fs.createReadStream(archivePath);

  var driverPath = path.resolve(driverConfig.path, driverConfig.binaryName);
  var driverWriteStream = fs.createWriteStream(driverPath, {mode: EXEC_MODE});

  var archiveParser = (
    archiveType === '.gz'
      ? targz().createParseStream()
      : unzip.Parse()
  );

  inputArchiveStream
    .pipe(archiveParser)
    .on('entry', function (entry) {
      if (entry.type === 'File') {
        entry.pipe(driverWriteStream);
      }
    })
    .on('error', cb)
    .on('close', cb);
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
    decompressArchive.bind(null, driverConfig)
  ];

  async.series(tasks, function (err) {
    if (err) {
      cb(err);
    } else {
      cb(null, getDriverPathTaskResult(driverName));
    }
  });
};
