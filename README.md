# hashflux <img src="https://user-images.githubusercontent.com/1423657/38137158-590eefbc-3423-11e8-96dd-487022b5618c.gif" width=100 /><img src="https://g.codefresh.io/api/badges/build?repoOwner=lmangani&repoName=hashflux&branch=master&pipelineName=hashflux&accountName=lmangani&type=cf-1"/>

Hashring InfluxDB Proxy based on metrics name

###### WARNING: This project is highly experimental and is not suitable for production (yet)


### Usage
HashFlux acts as a proxy between an InfluxDB client *(ie: Cronograf, Kapacitor)* and multiple InfluxDB server instances, dispatching individual or global queries based on metric consistent metric name hashing, and aggregating results transparently. 

![hashflux](https://user-images.githubusercontent.com/1423657/38781013-e0550dca-40d6-11e8-953d-83f6a1417c9f.gif)

#### Configuration
Hashflux is initialized and configured as follows:
```
const hashFlux = require('hashflux');

var options = { servers: [ '127.0.0.1:8086', '127.0.0.2:8086' ], port: 3000 };
var server = new hashFlux(options);
```

#### Todo
* [x] Sharded Writes
* [x] Sharded Queries
* [x] Gloabl Commands
* [ ] Documentation
* [ ] Test Coverage
* [ ] Performance Tests
