'use strict';

var isDir = require('is-dir');
var cli = require('./cli');
var path = require('path');
var resolve = path.resolve;

var NO_HOME_VAR_FOUND_IN_ENV = 1;
var INVALID_ENV_PATH_LOCATION = 2;
var home = process.env.HOME || process.env.USERPROFILE;
var SELENIUM_BINARIES_HOME = process.env.SELENIUM_BINARIES_HOME;

if (process.env.SELENIUM_BINARIES_HOME) {
  if (!isDir.sync(process.env.SELENIUM_BINARIES_HOME)) {
    cli.error('SELENIUM_BINARIES_HOME was set to a path that does not exist!');
    cli.exit(INVALID_ENV_PATH_LOCATION);
  }
} else if ('root' === process.env.USER) {
  SELENIUM_BINARIES_HOME = resolve(__dirname, 'selenium-binaries');
} else {
  if (!home) {
    cli.err('Neither of HOME or USERPROFILE were set in the env!');
    cli.exit(NO_HOME_VAR_FOUND_IN_ENV);
  }
  SELENIUM_BINARIES_HOME = resolve(home, '.selenium-binaries');
}

process.env.SELENIUM_BINARIES_HOME = SELENIUM_BINARIES_HOME;