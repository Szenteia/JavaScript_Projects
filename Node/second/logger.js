const EventEmitter = require('events');

var url = "http://mylogger.io/log";


class Logger extends EventEmitter{  //class is a container for properties and functions

    //function inside a class is called a method
    log(message){
        //send an HTTP request
        console.log(message);

        //Raise an event
        this.emit('messageLogged', {id: 1, url: 'http://'});
        
    }
}


module.exports = Logger;   //export the class
module.exports.endPoint = url;