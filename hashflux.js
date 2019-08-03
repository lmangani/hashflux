var HashRing = require('hashring');
const Theodore = require('theodore')
const extend = require("xtend");


module.exports = function HashFlux(options) {
  if (!options||!options.servers) options = { servers: ['http://127.0.0.1:8089'] };

  var self = {};
  var clients = {};
  var servers = options.servers;
  self.ring = new HashRing(servers);
  self.app = new Theodore()

  self.req = require('req-fast');
  /* API Resolver */
  var apiCall = function(body,url,server) {
    if(options.debug) console.log('REMOTE FETCH TRY',server,url);
    return new Promise((resolve, reject) => {
      self.req({
        method: 'POST',
        url: server + url,
        dataType: 'JSON',
        data: body
      }, (err, resp) => {
        if (err) {
          if (options.debug) console.log('[REQ ERROR]', err.message, server, url)
       	  reject;
        }
        // if (options.debug) console.log('API combo element',resp)
        resolve(resp.body || {} );
      })

    });
  };

  /* WRITE Handler */
  self.app.post('/write', (req, res) => {
    try {
      var key = Object.keys(req.body)[0];
      var node = self.ring.get(key);
      if (options.debug) console.log('POST HASHRING', node, key);
    } catch(e) { console.log('[HASH WRITE]',key,node) }
    if (options.debug) console.log('WRITE DEBUG',req.body);

    // if (options.debug) console.log('POST WRITE SHARD',node + req.url, req.body)
    self.req({
      method: 'POST',
      url: node + req.url,
      //dataType: 'JSON',
      headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: req.body
    }, (err, resp) => {
      if (err) {
        if (options.debug) console.log('[WRITE POST ERROR]', err.message, node, req.url)
        return res.send(err.message, 404)
      } else {
        if (options.debug) console.log('WRITE response',resp)
        return res.send(resp.body,resp.statusCode)
      }
    })
  })

  /* QUERY Handler */
  self.app.post('/query', (req, res) => {
    try{
    var key = req.body.match(/FROM ([^WHERE|^.]+)/)[0].split('"').join('');
    var db = req.body.match(/database/i);
    } catch(e) { console.log('[BAD HASH]', e, req) }

    if (key && !db) {
	/* sharded query */
	    var node = self.ring.get(key);
	    if (options.debug) console.log('HASHRING', node, key);
	    // if (options.debug) console.log('RING QUERY',node, req.body)
	    self.req({
	      method: 'POST',
	      url: node + req.url,
	      dataType: 'JSON',
	      data: req.body
	    }, (err, resp) => {
	      if (err) {
	        if (options.debug) console.log('[QUERY ERROR]', err.message, node, req.url)
	        return res.send(err.message, 404)
	      }
	      // if (options.debug) console.log('QUERY response',resp)
	      if(!resp) resp = {};
	      return res.json(resp, 200)
	    })
    } else {
	/* global query */
	    Promise.all( servers.map(server => apiCall(req.body,req.url,server) )).then((combo) => {
	      if (options.debug) console.log('QUERY COMBO response',JSON.stringify(combo));
	      if(combo) {
	        var output = {};
	        combo.forEach(function(item){
		  if (item && item.results) { output = extend(item.results[0], output); }
		  else { output = extend({}, output); }
	        });
	        if (options.debug) console.log('QUERY MERGE RESPONSE',output);
	        return res.json({ results: [output] }, 200);
              }
	    }).catch((error) => {
	      if (options.debug) console.log(error);
	      return res.send(error,500);
	    });


    }
  })

  /* FALLBACK Handler */
  self.app.post('/*', (req, res) => {
    // Query All Servers, Aggregate responses
    console.log('UNHANDLED:', req.url, req.query);
  })

/*
  self.app.post('/*', (req, res) => {
    // Query All Servers, Aggregate responses
    Promise.all( servers.map(server => apiCall(req.body,req.url,server) )).then((combo) => {
        if (options.debug) console.log('FALLBACK COMBO',JSON.stringify(combo));
	var output = {};
        combo.forEach(function(item){ if (item && item.results) output = extend(item.results[0], output); });
        if (options.debug) console.log('FALLBACK MERGE RESPONSE',output);
        return res.json({ results: [output]}, 200);
      }).catch((error) => {
        if (options.debug) console.log(error);
	return res.json(error,500);
      });
  })
*/

  /* PING Handler */
  self.app.get('/ping', (req, res) => {
	if (options.debug) console.log('PING req', req);
        return res.send('ok', 204);
  })

  self.app.listen(options.port||3000)

}



