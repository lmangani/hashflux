# hashflux <img src="https://user-images.githubusercontent.com/1423657/38137158-590eefbc-3423-11e8-96dd-487022b5618c.gif" width=100 /><img src="https://travis-ci.org/lmangani/hashflux.svg?branch=master"/>

Hashring InfluxDB Proxy based on metrics name

```
const hashFlux = require('hashflux');

var options = { servers: [ '127.0.0.1:8086', '127.0.0.2:8086' ], port: 3000 };
var server = new hashFlux(options);
```

#### Todo
* [x] Sharded Writes
* [ ] Sharded Queries
* [ ] Gloabl Commands
