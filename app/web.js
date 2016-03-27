var express = require('express');
var process = require('process');
var http = require('http');
var path = require('path');

var utils = require('./utils.js');
var config = require('./config.js');
var TextMessageModel = require('./TextMessageModel.js');
var UserModel = require('./UserModel.js');

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
    UserModel.find({}, function (err, usersCollection) {
        if (err) {
            console.log('error');
            return;
        } else {
            var users = utils.createHash(usersCollection, 'id');
            debugger;
            TextMessageModel.find(function (err, messagesCollection) {
                if (err) {
                    console.log('error');
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(messagesCollection.map(function (message) {
                        return {
                            user: users[message.userId] ? users[message.userId].toString() : 'unknown user',
                            body: message.body,
                            date: message.date
                        }
                    })));
                }
            })
        }
    });
});

app.use(express.static(path.join(process.cwd(), 'static')));

app.use(function (req, res, next) {
    res.writeHead(404);
    res.end('not found');
});

http.createServer(app).listen(config.web.port, config.web.ip, function() {
    console.log(`Application worker ${process.pid} started...`);
});
