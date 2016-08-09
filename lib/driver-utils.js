'use strict';

var fs = require('fs');
var path = require('path');
var targz = require('tar.gz');
var unzip = require('unzip');
var download = require('download');
var which = require('which');
var config = require('./config');
var cli = require('./cli');
var READ_MODE = parseInt('666', 8);
var EXEC_MODE = parseInt('755', 8);

function getDriverPathTaskResult(driverName) {
  var driverConfig = config.binaries[driverName];
  var result = {};

  result.driverName = driverName;
  result.driverPath = path.resolve(driverConfig.binary.path, driverConfig.binary.name);

  return result;
}

function downloadDriver(url, dest, opts, cb) {
  var request;
  var contentLength;
  var amountDownloaded = 0;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  request = download(url, dest, opts);

  request.on('response', function(res) {
    contentLength = parseInt(res.headers['content-length']);
  });

  request.on('error', function(err) {
    cb(new Error(err));
  });

  request.on('data', function(data) {
    amountDownloaded += data.length;
    cli.clearLog('Status: ' + amountDownloaded + ' of ' + contentLength);
  });

  request.on('close', function() {
    cli.log('Finished downloading ' + url + '\n');
    cb();
  });
}

function findDriver(driverName) {
  var driverConfig = config.binaries[driverName];
  var binaryName = driverConfig.binary.name;
  var binaryPath = path.resolve(driverConfig.binary.path, binaryName);

  try {
    return which.find(binaryName);
  } catch (e) {
    return (fs.existsSync(binaryPath) ? binaryPath : null);
  }
}

function ensureDriver(driverName, cb) {
  var driverConfig = config.binaries[driverName];
  var downloadUrl = driverConfig.download.url + driverConfig.download.name;
  var driverFoundPath = findDriver(driverName);

  if (driverFoundPath) {
    cli.log('Found ' + driverName + ' at ' + driverFoundPath + '\n');
    return cb(null, getDriverPathTaskResult(driverName));
  }

  cli.log('Downloading ' + driverConfig.download.name);
  cli.log(downloadUrl);
  cli.log(' -> ' + driverConfig.binary.path + '\n');

  downloadDriver(downloadUrl, driverConfig.binary.path, {mode: READ_MODE}, function (error) {
    if (error) {
      cb(error);
      return;
    }
    cb(null, getDriverPathTaskResult(driverName));
  });
}

function decompressArchive(driverName, cb) {
  var driverConfig = config.binaries[driverName];
  var driverFoundPath = findDriver(driverName);

  if (!driverFoundPath) {
    var inputArchiveStream = fs.createReadStream(path.resolve(driverConfig.binary.path, driverConfig.download.name));
    var driverWriteStream = fs.createWriteStream(path.resolve(driverConfig.binary.path, driverConfig.binary.name), {mode: EXEC_MODE});
    var archiveParser = (path.extname(driverConfig.download.name) === '.gz' ? targz().createParseStream() : unzip.Parse());

    inputArchiveStream
      .pipe(archiveParser)
      .on('entry', function (entry) {
        if (entry.type === 'File') {
          entry.pipe(driverWriteStream);
        }
      })
      .on('error', cb)
      .on('close', cb);
  } else {
    cb(null);
  }
}

module.exports = {
  ensureDriver: ensureDriver,
  decompressArchive: decompressArchive
};
