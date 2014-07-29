'use strict';

var fs = require('fs');
var isDir = require('is-dir');
var mkdirp = require('mkdirp');
var path = require('path');
var resolve = path.resolve;
var cli = require('./cli');
var NO_HOME_VAR_FOUND_IN_ENV=1;
var INVALID_ENV_PATH_LOCATION=2;
var home = process.env.HOME || process.env.USERPROFILE;
var SELENIUM_BINARIES_HOME = process.env.SELENIUM_BINARIES_HOME;
var READ_MODE = parseInt('666', 8);
var EXEC_MODE = parseInt('755', 8);
var binaryPath;
var escapeBackSlashes = function(path){
  return path.replace(/\\+/g, '\\\\');
};

if(process.env.SELENIUM_BINARIES_HOME){
  if(!isDir.sync(process.env.SELENIUM_BINARIES_HOME)){
    cli.error('SELENIUM_BINARIES_HOME was set to a path that does not exist!');
    cli.exit(INVALID_ENV_PATH_LOCATION);
  }
} else if('root' === process.env.USER){
  SELENIUM_BINARIES_HOME = resolve(__dirname, 'selenium-binaries');
} else {
  if(!home){
    cli.err('Neither of HOME or USERPROFILE were set in the env!');
    cli.exit(NO_HOME_VAR_FOUND_IN_ENV);
  }
  SELENIUM_BINARIES_HOME = resolve(home, '.selenium-binaries');
}

process.env.SELENIUM_BINARIES_HOME = SELENIUM_BINARIES_HOME;

var async = require('async');
var configureIe = require('./configure-ie');

var downloadBinary = require('./download-binary');
var unzip = require('unzip');
var config = require('./config');

var findsChromeDriver = require('./finders/finds-chrome-driver');
var findsIEDriver     = require('./finders/finds-ie-driver');
var findsSeleniumJar  = require('./finders/finds-selenium-jar');

var chromeConfig      = config.binaries.chromedriver;
var ieConfig          = config.binaries.iedriver;
var seleniumConfig    = config.binaries.selenium;

var chromedriverDownloadUrl = chromeConfig.download.url + chromeConfig.download.name;
var seleniumDownloadUrl     = seleniumConfig.download.url + seleniumConfig.download.name;
var ieDownloadUrl           = ieConfig.download.url + ieConfig.download.name;

var chromedriver      = findsChromeDriver.find();
var iedriver          = findsIEDriver.find();
var seleniumJar       = findsSeleniumJar.find();

var cli = require('./cli');
var log = cli.log;

var tasks = [
  function ensureSelenium(cb){
    if(seleniumJar) {
      log('Found Selenium at ' + seleniumJar + '\n');
      return cb();
    }

    log('Downloading selenium');
    log(seleniumDownloadUrl);
    log(' -> ' + seleniumConfig.binary.path +'\n');

    seleniumJar = resolve(seleniumConfig.binary.path, seleniumConfig.binary.name);

    downloadBinary(seleniumDownloadUrl, seleniumConfig.binary.path, {mode:READ_MODE}, cb);
  },
  function ensureChromedriver(cb){
    if(chromedriver) {
      log('Found chromedriver at ' + chromedriver + '\n');
      return cb();
    }

    log('Downloading chromedriver');
    log(chromedriverDownloadUrl);
    log(' -> ' + chromeConfig.binary.path + '\n');

    downloadBinary(chromedriverDownloadUrl, chromeConfig.binary.path, {mode:READ_MODE}, cb);
  },
  function unzipChromedriver(cb){
    var rStream;
    if(!chromedriver){
      rStream = fs.createReadStream(resolve(chromeConfig.binary.path, chromeConfig.download.name));
      rStream
        .pipe(unzip.Parse())
        .on('entry', function(entry){
          if(entry.type === 'File'){
            entry.pipe(fs.createWriteStream(
              resolve(chromeConfig.binary.path, entry.path),
              {mode:EXEC_MODE}
             ));
          }
        })
        .on('error', function(err){
          cb(err);
        })
        .on('close', function(){
          chromedriver = resolve(chromeConfig.binary.path, chromeConfig.binary.name);
          cb();
        });
    } else cb();
  }
];

if(config.isWin){
  tasks.push(function ensureIEDriver(cb){
    if(iedriver) {
      log('Found iedriver at ' + iedriver + '\n');
      return cb();
    }

    log('Downloading IEDriver');
    log(ieDownloadUrl);
    log(' -> ' + ieConfig.binary.path + '\n');

    downloadBinary(ieDownloadUrl, ieConfig.binary.path, {mode:READ_MODE}, cb);
  });
  tasks.push(function unzipIEDriver(cb){
    var rStream;
    if(!iedriver){
      rStream = fs.createReadStream(resolve(ieConfig.binary.path, ieConfig.download.name));
      rStream
        .pipe(unzip.Parse())
        .on('entry', function(entry){
          if(entry.type === 'File'){
            entry.pipe(fs.createWriteStream(
              resolve(ieConfig.binary.path, entry.path),
              {mode:EXEC_MODE}
             ));
          }
        })
        .on('error', function(err){
          cb(err);
        })
        .on('close', function(){
          iedriver = resolve(ieConfig.binary.path, ieConfig.binary.name);
          cb();
        });
    }
  });

  tasks.push(function(cb){
    configureIe(cb);
  });
}

Object.keys(config.binaries)
  .forEach(function(resource){
    var path = config.binaries[resource].binary.path;
    mkdirp.sync(path);
  });

async.series(tasks, function(err, results){
  var binaries;

  if(err){
    cli.err('The following error occurred:');
    cli.err(err);
    return cli.exit(1);
  }

  binaries = {
    home: SELENIUM_BINARIES_HOME,
    iedriver: iedriver,
    chromedriver: chromedriver,
    seleniumserver: seleniumJar
  };

  fs.writeFileSync(
    resolve(__dirname, '..', 'binary-paths.json'),
    JSON.stringify(binaries, null, '  ')
  );
});
