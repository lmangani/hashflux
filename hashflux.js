var HashRing = require('hashring');
const Theodore = require('theodore')

module.exports = function HashFlux(options) {
  if (!options||!options.servers) options = { servers: ['127.0.0.1:3002'] };

  var self = {};
  var clients = {};
  self.app = new Theodore()
  self.req = require('req-fast');
  var servers = options.servers;
  self.ring = new HashRing(servers);

  self.app.post('/*', (req, res) => {
    var node = self.ring.get(Object.keys(req.body)[0]);
    console.log(node, Object.keys(req.body)[0]);
    var url = 'http://'+node+req.url;
    console.log(url, req.body)
    self.req({
      method: 'POST',
      url: url,
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

  self.app.listen(options.port||3000)

}

