# selenium-binaries [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url]
> Downloads Selenium related binaries for your OS

## How do I use this?
1. Add it as a dependency in your `package.json` file.
2. `npm install`
3. `var chromedriverPath = require('selenium-binaries').chromedriver;`
4. `process.env.CHROME_DRIVER_PATH = chromedriverPath;` Do this as required.

The module exposes the following paths:
* `chromedriver`
* `iedriver`
* `seleniumserver`

## Where do binaries get installed?
If you're running as `root` on \*nix based systems, binaries go under
`/lib/selenium-binaries`.  Otherwise, binaries go under `$HOME/.selenium-binaries`.
Installing multiple versions of the same binary is handled appropriately across
your projects.

## Why not put binaries in the project?
Because they exceed 36MB in size.  Save the hard drive!

## Binaries
Here's the deal...

### selenium-server-standalone.jar
You need to install this on any OS, so this module takes care of that.

### ChromeDriver
You need to install this on any OS, so this module takes care of that.

### IEDriver
You only need this on windows, so this module takes care of that.

In addition, you have to set registry values that deal with IE security settings.
This module takes care of that as well.

##LICENSE
``````
The MIT License (MIT)

Copyright (c) 2014 Joseph Spencer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
``````

[downloads-image]: http://img.shields.io/npm/dm/selenium-binaries.svg
[npm-url]: https://npmjs.org/package/selenium-binaries
[npm-image]: http://img.shields.io/npm/v/selenium-binaries.svg

[travis-url]: https://travis-ci.org/spunjs/selenium-binaries
[travis-image]: http://img.shields.io/travis/spunjs/selenium-binaries.svg
