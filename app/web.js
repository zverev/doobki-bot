var http = require('http');

var config = require('./config.js');

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

server.listen(config.web.port, config.web.ip, function() {
    console.log(`Application worker ${process.pid} started...`);
});
