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

module.exports = {
  isWin: isWin,
  version: packageJson.version,
  binaries: {
    selenium: {
      version: '2.48',
      download: {
        name: 'selenium-server-standalone-2.48.2.jar',
        url: 'http://selenium-release.storage.googleapis.com/2.48/'
      },
      binary: {
        name: 'selenium-server-standalone-2.48.2.jar',
        path: path.resolve(SELENIUM_BINARIES_HOME, 'selenium', '2.48.2')
      }
    },
    chromedriver: {
      version: '2.20',
      download: {
        name: 'chromedriver_'
          + ( isWin
              ? 'win32'
              : ( isMac
                  ? 'mac32'
                  : ( is64
                      ? 'linux64'
                      : 'linux32'
                    )
                )
            )
          + '.zip',
        url:'http://chromedriver.storage.googleapis.com/2.20/'
      },
      binary: {
        name: 'chromedriver' + ( isWin ? '.exe' : ''),
        path: path.resolve(SELENIUM_BINARIES_HOME, 'chromedriver', '2.20')
      }
    },
    iedriver: {
      version: '2.42.0',
      download: {
        name: 'IEDriverServer_'
          + ( is64
              ? 'x64'
              : 'Win32'
            )
          + '_2.42.0.zip',
        url:'http://selenium-release.storage.googleapis.com/2.42/'
      },
      binary: {
        name: 'IEDriverServer.exe',
        path: path.resolve(SELENIUM_BINARIES_HOME, 'iedriver', '2.42.0')
      }
    }
  }
};
