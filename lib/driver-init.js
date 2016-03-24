'use strict';

var downloadBinary = require('./download-binary');
var unzip = require('unzip');
var zlib = require('zlib');
var config = require('./config');
var cli = require('./cli');
var log = cli.log;
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;
var READ_MODE = parseInt('666', 8);
var EXEC_MODE = parseInt('755', 8);

function ensureDriver(driverName, cb){
	var driverConfig = config.binaries[driverName];
	var downloadUrl = driverConfig.download.url + driverConfig.download.name;
	var driverFoundPath = findDriver(driverName);

	if(driverFoundPath) {
		log('Found ' + driverName + ' at ' + driverFoundPath + '\n');
		return cb(null, getDriverPathTaskResult(driverName));
	}

	log('Downloading ' + driverConfig.download.name);
	log(downloadUrl);
	log(' -> ' + driverConfig.binary.path + '\n');

	downloadBinary(downloadUrl, driverConfig.binary.path, {mode:READ_MODE}, function(error)
	{
		if (error)
		{
			cb(error);
			return;
		}
		
		cb(null, getDriverPathTaskResult(driverName));
	});
}

function unzipDriver(driverName, cb){
	var driverConfig = config.binaries[driverName];
	var driverFoundPath = findDriver(driverName);

	if(!driverFoundPath){
		var inputArchiveStream = fs.createReadStream(resolve(driverConfig.binary.path, driverConfig.download.name));
		var driverWriteStream = fs.createWriteStream(
			resolve(driverConfig.binary.path, driverConfig.binary.name),
			{mode: EXEC_MODE}
		);

		if (path.extname(driverConfig.download.name) === '.gz')
		{
			inputArchiveStream
				.pipe(zlib.createGunzip())
				.pipe(driverWriteStream)
				.on('error', cb)
				.on('close', cb);
		}
		else
		{
			inputArchiveStream
				.pipe(unzip.Parse())
				.on('entry', function (entry)
				{
					if (entry.type === 'File')
					{
						entry.pipe(driverWriteStream);
					}
				})
				.on('error', cb)
				.on('close', cb);
		}
	} else {
		cb(null);
	}
}

function findDriver(driverName)
{
	var which = require('which');
	var driverConfig = config.binaries[driverName];
	var binaryName = driverConfig.binary.name;
	var defaultPath = path.resolve(
		driverConfig.binary.path,
		binaryName
	);

	try {
		return which.find(binaryName);
	} catch(e) {
		if(fs.existsSync(defaultPath)) {
			return defaultPath;
		} else {
			return null;
		}
	}
}

function getDriverPathTaskResult(driverName)
{
	var driverConfig = config.binaries[driverName];
	var result = {};

	result.driverName = driverName;
	result.driverPath = resolve(driverConfig.binary.path, driverConfig.binary.name);

	return result;
}

module.exports.ensureDriver = ensureDriver;
module.exports.unzipDriver = unzipDriver;