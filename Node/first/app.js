const path = require('path');
const os = require('os');
const fs = require('fs');

//file system
const files = fs.readdirSync('./')
console.log(files);

//async version of file reading, callback function!!
fs.readdir('./', function(err, files){
    if(err) console.log('Error', err);
    else console.log('Result', files);
});

//file path
//var pathObj = path.parse(__filename);
//console.log(pathObj);

//ES6 template string for memory and uptime datas
var totalMemory = os.totalmem();
var freeMemory = os.freemem();
var upTime = os.uptime();

console.log(`Total Memory: ${totalMemory}`);
console.log(`Free Memory: ${freeMemory}`);
console.log(`Up Time: ${upTime}`);

//const logger = require('./logger');

//var message = 'message';
//console.log(message);

//console.log(module);

//console.log(logger);
//logger.log("message from app.js");
