var express = require('express');
var process = require('process');
var http = require('http');
var path = require('path');

var config = require('./config.js');
var TextMessageModel = require('./TextMessageModel.js');

var app = express();

app.use(function (req, res, next) {
    if (req.url == '/health') {
        res.writeHead(200);
        res.end('ok');
    } else {
        next();
    }
});

app.get('/api/messages', function (req, res) {
    TextMessageModel.find(function (err, messages) {
        if (err) {
            console.log('error');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(messages));
        }
    })
});

app.use(express.static(path.join(process.cwd(), 'static')));

app.use(function (req, res, next) {
    res.writeHead(404);
    res.end('not found');
});

http.createServer(app).listen(config.web.port, config.web.ip, function() {
    console.log(`Application worker ${process.pid} started...`);
});
