'use strict';

var isDir = require('is-dir');
var path = require('path');
var cli = require('./cli');

var ERR_NO_HOME_VAR_FOUND_IN_ENV = 1;
var ERR_INVALID_ENV_PATH_LOCATION = 2;
var USER_HOME = process.env.HOME || process.env.USERPROFILE;
var SELENIUM_BINARIES_HOME = process.env.SELENIUM_BINARIES_HOME;

if (process.env.SELENIUM_BINARIES_HOME) {
  if (!isDir.sync(process.env.SELENIUM_BINARIES_HOME)) {
    cli.error('SELENIUM_BINARIES_HOME was set to a path that does not exist!');
    cli.exit(ERR_INVALID_ENV_PATH_LOCATION);
  }
} else if ('root' === process.env.USER) {
  SELENIUM_BINARIES_HOME = path.resolve(__dirname, 'selenium-binaries');
} else {
  if (!USER_HOME) {
    cli.err('Neither of HOME or USERPROFILE were set in the env!');
    cli.exit(ERR_NO_HOME_VAR_FOUND_IN_ENV);
  }
  SELENIUM_BINARIES_HOME = path.resolve(USER_HOME, '.selenium-binaries');
}

process.env.SELENIUM_BINARIES_HOME = SELENIUM_BINARIES_HOME;
