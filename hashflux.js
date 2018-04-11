var HashRing = require('hashring');
const Theodore = require('theodore')

module.exports = function HashFlux(options) {
  if (!options||!options.servers) options = { servers: ['http://127.0.0.1:8089'] };

  var self = {};
  var clients = {};
  self.app = new Theodore()
  self.req = require('req-fast');
  var servers = options.servers;
  self.ring = new HashRing(servers);


  /* WRITE Handler */
  self.app.post('/write*', (req, res) => {
    var key = Object.keys(req.body)[0];
    var node = self.ring.get(key);
    console.log('HASHRING', node, key);
    console.log('WRITE SHARD',node + req.url, req.body)
    self.req({
      method: 'POST',
      url: node + req.url,
      dataType: 'JSON',
      data: req.body
    }, (err, resp) => {
      if (err) {
        console.log('[ERROR]', err.message)
        return res.send(err.message, 404)
      }
      console.log(resp)
      return res.send(resp, 200)
    })
  })

  /* QUERY Handler */
  self.app.post('/query*', (req, res) => {
    var key = req.body.match(/FROM ([^WHERE|^.]+)/)[0].split('"').join('');
    var node = self.ring.get(key);
    console.log('HASHRING', node, key);
    console.log('RING QUERY',node, req.body)
    self.req({
      method: 'POST',
      url: node + req.url,
      dataType: 'JSON',
      data: req.body
    }, (err, resp) => {
      if (err) {
        console.log('[ERROR]', err.message)
        return res.send(err.message, 404)
      }
      console.log(resp)
      return res.send(resp, 200)
    })
  })

  /* FALLBACK Handler */
  self.app.post('/*', (req, res) => {
    // Query All Servers, Aggregate responses
    console.log('CATCHALL', req.url, req.body)
    Promise.all( servers.map(server => apiCall(req.body,req.url,server) )).then((combo) => {
        // completed array of bodies
        console.log(combo);
        // foo(combo.length, [...args]);
        return res.send(combo, 200);
      }).catch((error) => {
        console.log(error);
	return res.send(error,500);
      });
  })

  self.app.listen(options.port||3000)

}


// API Resolver
function apiCall(body,url,server) {
  return new Promise((resolve, reject) => {
    self.req({
      method: 'POST',
      url: server + url,
      dataType: 'JSON',
      data: body
    }, (err, resp) => {
      if (err) {
        console.log('[ERROR]', err.message)
	reject;
      }
      console.log(resp)
      resolve(resp.body || {} );
    })

  });
}

