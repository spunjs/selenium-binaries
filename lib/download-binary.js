'use strict';

var fs = require('fs');
var download = require('download');
var cli = require('./cli');

module.exports =

function downloadBinary(url, dest, opts, cb){
  var contentLength;
  var amountDownloaded=0;
  var request;

  if(!fs.existsSync(dest)){
    fs.mkdirSync(dest);
  }

  request = download(url, dest, opts);

  request.on('response', function(res){
    contentLength = parseInt(res.headers['content-length']);
  });

  request.on('error', function(err){
    cb(new Error(err));
  });

  request.on('data', function(data){
    amountDownloaded+=data.length;
    cli.clearLog('Status: '+amountDownloaded+' of '+contentLength);
  });

  request.on('close', function(){
    cli.log('Finished downloading '+url+'\n');
    cb();
  });
};
