const hashFlux = require('./hashflux');

var options = { servers: [ '127.0.0.1:8086' ], port: 3000 };
var server = new hashFlux(options);
