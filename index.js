const hashFlux = require('./hashflux');

var servers = process.env.SERVERS.split(',') || ['http://127.0.0.1:8086'];
var port = process.env.PORT || 8086;

var options = { servers: servers, port: port };
var server = new hashFlux(options);
