//how to create a module
// imagine using remote login service

var url = "http://mylogger.io/log";
function log(message){
    //send an HTTP request
    console.log(message);
    
}

module.exports.log = log;
module.exports.endPoint = url;