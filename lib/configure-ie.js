'use strict';

var async = require('async');
var exec = require('child_process').exec;
var cli = require('./cli');
var packageJson = require('../package.json');
var UNABLE_TO_ENABLE_PROTECTED_MODE_FOR_IE=2;

module.exports = function(cb){
  async.parallel([
    prepareEnableProtectedModeFor(0),
    prepareEnableProtectedModeFor(1),
    prepareEnableProtectedModeFor(2),
    prepareEnableProtectedModeFor(3),
    prepareEnableProtectedModeFor(4)
  ], function(err){
    if(err){
      cli.err('Unable to enable protected mode for internet explorer!');
      cli.err('Please report this at ' + packageJson.bugs.url);
      cli.err(err.message);
      cli.err(err.stack);
      cli.exit(UNABLE_TO_ENABLE_PROTECTED_MODE_FOR_IE);
    }
    cb();
  });
};

function prepareEnableProtectedModeFor(zone){
  return function enableProtectedModeForZone(cb){
    exec(
      'reg '
      + 'add '
      + '"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones\\' + zone + '" '
      + '/t REG_DWORD '
      + '/v 2500 '
      + '/d 0 '
      + '/f'
      , cb
    );
  };
}
