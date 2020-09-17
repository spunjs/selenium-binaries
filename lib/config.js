'use strict';

var packageJson = require('../package.json');
var path = require('path');
var util = require('util');
var os = require('os');

var arch = os.arch();
var platform = os.platform();
var is64 = /x64/i.test(arch);
var isWin = /^win/i.test(platform);
var isMac = /^dar/i.test(platform);

var SELENIUM_BINARIES_HOME = process.env.SELENIUM_BINARIES_HOME;
var SELENIUM_BINARIES_SERVER_STANDALONE_VERSION = process.env.SELENIUM_BINARIES_SERVER_STANDALONE_VERSION || '3.141.59';
var SELENIUM_BINARIES_CHROMEDRIVER_VERSION = process.env.SELENIUM_BINARIES_CHROMEDRIVER_VERSION || '2.46';
var SELENIUM_BINARIES_GECKODRIVER_VERSION = process.env.SELENIUM_BINARIES_GECKODRIVER_VERSION || '0.24.0';
var SELENIUM_BINARIES_IEDRIVER_VERSION = process.env.SELENIUM_BINARIES_IEDRIVER_VERSION || '3.14.0';

if (typeof process.env.SELENIUM_BINARIES_FORCE_32BITS !== 'undefined') {
  is64 = is64 && !(/^1|true$/i).test('' + process.env.SELENIUM_BINARIES_FORCE_32BITS);
}

function getMajorMinorVersion(semVer) {
  return semVer.substring(0, semVer.lastIndexOf('.'));
}

module.exports = {
  version: packageJson.version,
  binariesPath: SELENIUM_BINARIES_HOME,
  is64: is64,
  isWin: isWin,
  isMac: isMac,
  binaries: {
    seleniumserver: {
      version: SELENIUM_BINARIES_SERVER_STANDALONE_VERSION,
      url: util.format(
        'https://selenium-release.storage.googleapis.com/%s/',
        getMajorMinorVersion(SELENIUM_BINARIES_SERVER_STANDALONE_VERSION)
      ),
      path: path.resolve(
        SELENIUM_BINARIES_HOME,
        'selenium',
        SELENIUM_BINARIES_SERVER_STANDALONE_VERSION
      ),
      archiveName: util.format(
        'selenium-server-standalone-%s.jar',
        SELENIUM_BINARIES_SERVER_STANDALONE_VERSION
      ),
      binaryName: util.format(
        'selenium-server-standalone-%s.jar',
        SELENIUM_BINARIES_SERVER_STANDALONE_VERSION
      )
    },
    chromedriver: {
      version: SELENIUM_BINARIES_CHROMEDRIVER_VERSION,
      url: util.format(
        'https://chromedriver.storage.googleapis.com/%s/',
        SELENIUM_BINARIES_CHROMEDRIVER_VERSION
      ),
      path: path.resolve(
        SELENIUM_BINARIES_HOME,
        'chromedriver',
        SELENIUM_BINARIES_CHROMEDRIVER_VERSION
      ),
      archiveName: util.format(
        'chromedriver_%s.zip',
        (isWin ? 'win32' : (isMac ? (is64 ? 'mac64' : 'mac32') : (is64 ? 'linux64' : 'linux32')))),
      binaryName: 'chromedriver' + (isWin ? '.exe' : '')
    },
    geckodriver: {
      version: SELENIUM_BINARIES_GECKODRIVER_VERSION,
      url: util.format(
        'https://github.com/mozilla/geckodriver/releases/download/v%s/',
        SELENIUM_BINARIES_GECKODRIVER_VERSION
      ),
      path: path.resolve(
        SELENIUM_BINARIES_HOME,
        'geckodriver',
        SELENIUM_BINARIES_GECKODRIVER_VERSION
      ),
      archiveName: util.format(
        'geckodriver-v%s-%s',
        SELENIUM_BINARIES_GECKODRIVER_VERSION,
        (isWin ? 'win64.zip' : (isMac ? 'macos.tar.gz' : 'linux64.tar.gz'))
      ),
      binaryName: 'geckodriver' + (isWin ? '.exe' : '')
    },
    iedriver: {
      version: SELENIUM_BINARIES_IEDRIVER_VERSION,
      url: util.format(
        'https://selenium-release.storage.googleapis.com/%s/',
        getMajorMinorVersion(SELENIUM_BINARIES_IEDRIVER_VERSION)
      ),
      path: path.resolve(
        SELENIUM_BINARIES_HOME,
        'iedriver',
        SELENIUM_BINARIES_IEDRIVER_VERSION
      ),
      archiveName: util.format(
        'IEDriverServer_%s_%s.zip',
        (is64 ? 'x64' : 'Win32'),
        SELENIUM_BINARIES_IEDRIVER_VERSION
      ),
      binaryName: 'IEDriverServer.exe'
    }
  }
};
