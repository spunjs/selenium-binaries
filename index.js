'use strict';

var path = require('path');
var fs = require('fs');

//NOTE: binary-paths.json is created by the install script.
var binaryPaths = path.resolve(__dirname, 'binary-paths.json');

if (!fs.existsSync(binaryPaths)) {
  console.error('[selenium-binaries]', 'Could not find', binaryPaths);
  console.error('[selenium-binaries]', 'This file is generated during the install phase.');
  console.error('[selenium-binaries]', 'This most likely means some binaries failed to download.');
  console.error('[selenium-binaries]', 'Please re-install selenium-binaries accordingly.');
  console.error('[selenium-binaries]', 'If you did not install selenium-binaries directly, it has been added as a dependency somewhere.');
  console.error('[selenium-binaries]', 'Removing node_modules and running `npm install` may be an appropriate action.');
  process.exit(1);
}

module.exports = require(binaryPaths);
