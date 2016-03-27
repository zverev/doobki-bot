var express = require('express');
var http = require('http');

var config = require('./config.js');

var app = express();

app.set('port', config.web.port);

app.use(function (req, res, next) {
    if (req.url == '/health') {
        res.writeHead(200);
        res.end('ok');
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    res.writeHead(404);
    res.end('not found');
});

http.createServer(app).listen(config.web.port, config.web.ip, function() {
    console.log(`Application worker ${process.pid} started...`);
});
