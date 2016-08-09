'use strict';

var packageJson = require('../package.json');
var path = require('path');
var os = require('os');
var arch = os.arch();
var platform = os.platform();
var is64 = /x64/i.test(arch);
var isWin = /^win/i.test(platform);
var isMac = /^dar/i.test(platform);
var SELENIUM_BINARIES_HOME = process.env.SELENIUM_BINARIES_HOME;
var SELENIUM_BINARIES_SERVER_STANDALONE_VERSION = process.env.SELENIUM_BINARIES_SERVER_STANDALONE_VERSION || '2.53.1';
var SELENIUM_BINARIES_CHROMEDRIVER_VERSION = process.env.SELENIUM_BINARIES_CHROMEDRIVER_VERSION || '2.22';
var SELENIUM_BINARIES_GECKODRIVER_VERSION = process.env.SELENIUM_BINARIES_GECKODRIVER_VERSION || '0.9.0';
var SELENIUM_BINARIES_IEDRIVER_VERSION = process.env.SELENIUM_BINARIES_IEDRIVER_VERSION || '2.53.1';

function getMajorMinorVersion(semVer) {
  return semVer.substring(0, semVer.lastIndexOf('.'));
}

module.exports = {
  isWin: isWin,
  version: packageJson.version,
  binaries: {
    seleniumserver: {
      version: SELENIUM_BINARIES_SERVER_STANDALONE_VERSION,
      download: {
        name: 'selenium-server-standalone-' + SELENIUM_BINARIES_SERVER_STANDALONE_VERSION + '.jar',
        url: 'http://selenium-release.storage.googleapis.com/' + getMajorMinorVersion(SELENIUM_BINARIES_SERVER_STANDALONE_VERSION) + '/'
      },
      binary: {
        name: 'selenium-server-standalone-' + SELENIUM_BINARIES_SERVER_STANDALONE_VERSION + '.jar',
        path: path.resolve(SELENIUM_BINARIES_HOME, 'selenium', SELENIUM_BINARIES_SERVER_STANDALONE_VERSION)
      }
    },
    chromedriver: {
      version: SELENIUM_BINARIES_CHROMEDRIVER_VERSION,
      download: {
        name: 'chromedriver_'
          + (isWin
              ? 'win32'
              : (isMac
                  ? 'mac32'
                  : (is64
                      ? 'linux64'
                      : 'linux32'
                    )
                )
            )
          + '.zip',
        url: 'http://chromedriver.storage.googleapis.com/' + SELENIUM_BINARIES_CHROMEDRIVER_VERSION + '/'
      },
      binary: {
        name: 'chromedriver' + (isWin ? '.exe' : ''),
        path: path.resolve(SELENIUM_BINARIES_HOME, 'chromedriver', SELENIUM_BINARIES_CHROMEDRIVER_VERSION)
      }
    },
    geckodriver: {
      version: SELENIUM_BINARIES_GECKODRIVER_VERSION,
      download: {
        name: 'geckodriver-'
              + 'v' + SELENIUM_BINARIES_GECKODRIVER_VERSION + '-'
              + (isWin
                  ? 'win64.zip'
                  : (isMac
                      ? 'mac.tar.gz'
                      : 'linux64.tar.gz'
                    )
                ),
        url: 'http://github.com/mozilla/geckodriver/releases/download/v' + SELENIUM_BINARIES_GECKODRIVER_VERSION + '/'
      },
      binary: {
        name: 'geckodriver' + (isWin ? '.exe' : ''),
        path: path.resolve(SELENIUM_BINARIES_HOME, 'geckodriver', SELENIUM_BINARIES_GECKODRIVER_VERSION)
      }
    },
    iedriver: {
      version: SELENIUM_BINARIES_IEDRIVER_VERSION,
      download: {
        name: 'IEDriverServer_'
          + (is64
              ? 'x64'
              : 'Win32'
            )
          + '_' + SELENIUM_BINARIES_IEDRIVER_VERSION + '.zip',
        url: 'http://selenium-release.storage.googleapis.com/' + getMajorMinorVersion(SELENIUM_BINARIES_IEDRIVER_VERSION) + '/'
      },
      binary: {
        name: 'IEDriverServer.exe',
        path: path.resolve(SELENIUM_BINARIES_HOME, 'iedriver', SELENIUM_BINARIES_IEDRIVER_VERSION)
      }
    }
  }
};
