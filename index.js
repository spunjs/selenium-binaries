'use strict';

var cli = require('./lib/cli');
var path = require('path');
var fs = require('fs');
//NOTE: binary-paths.json is created by the install script.
var binaryPaths = path.resolve(__dirname, 'binary-paths.json');

var ERR_COULD_NOT_FIND_BINARY_PATHS = 1;

if (!fs.existsSync(binaryPaths)) {
  cli.err('Could not find ' + binaryPaths);
  cli.err('This file is generated during the install phase.');
  cli.err('This most likely means some binaries failed to download.');
  cli.err('Please re-install selenium-binaries accordingly.');
  cli.err('If you did not install selenium-binaries directly, it has been added as a dependency somewhere.');
  cli.err('Removing node_modules and running `npm install` may be an appropriate action.\n');
  cli.exit(ERR_COULD_NOT_FIND_BINARY_PATHS);
}

module.exports = require(binaryPaths);
