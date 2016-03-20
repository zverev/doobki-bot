var http = require('http');
var fs = require('fs');
var path = require('path');
var env = process.env;

var server = http.createServer(function(req, res) {
    var url = req.url
        // IMPORTANT: Your application HAS to respond to GET /health with status 200
        //            for OpenShift health monitoring
    if (url == '/health') {
        res.writeHead(200);
        res.end();
    } else {
        res.writeHead(200);
        res.end('hello');
    }
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker ${process.pid} started...`);
});
