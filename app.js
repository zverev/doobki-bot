var http = require('http');
var fs = require('fs');
var path = require('path');
var env = process.env;
var TelegramBot = require('node-telegram-bot-api');
var mongoose = require('mongoose');

var envTelegramToken = env.OPENSHIFT_TELEGRAM_TOKEN;
var envDbUsername = env.OPENSHIFT_MONGODB_DB_USERNAME;
var envDbPassword = env.OPENSHIFT_MONGODB_DB_PASSWORD;
var envDbHost = env.OPENSHIFT_MONGODB_DB_HOST;
var envDbPort = env.OPENSHIFT_MONGODB_DB_PORT;

if (!envTelegramToken || !envDbUsername || !envDbPassword || !envDbHost || !envDbPort) {
    // console.error('not all environment variables are set');
    var evars = ['PROPANEBOT_TOKEN', 'MONGODB_DB_USERNAME', 'MONGODB_DB_PASSWORD', 'MONGODB_DB_HOST', 'MONGODB_DB_PORT'].map(function (v) {
        return 'OPENSHIFT_' + v;
    }).filter(function (v) {
        return !env[v];
    });
    console.error('not all environment variables are set', evars);
    return;
}

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

var messageSchema = new mongoose.Schema({
    userid: Number,
    chatid: Number,
    username: String,
    type: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

messageSchema.methods.toString = function () {
    return this.username + ': ' + (this.body || this.type);
}

var MessageModel = mongoose.model('Message', messageSchema);

var connectionString = 'mongodb://' + envDbHost + ':' + envDbPort + '/propanebot';
mongoose.connect(connectionString, {
    user: envDbUsername,
    pass: envDbPassword
})

// Setup polling way
var bot = new TelegramBot(envTelegramToken, {
    polling: true
});

// Any kind of message
bot.on('message', function(msg) {
    // debugger;
    var userName = (msg.from.first_name || '') + (msg.from.last_name || '') + (msg.from.username || '');
    var userId = msg.from.id;

    var msgType, msgBody;
    if (msg.text) {
        msgType = 'text';
        msgBody = msg.text;
    } else if (msg.photo && msg.photo.length) {
        msgType = 'photo';
        msgBody = msg.photo[msg.photo.length - 1].file_id;
    } else {
        msgType = 'unknown';
        msgBody = '';
    }

    var message = new MessageModel({
        userid: msg.from.id,
        chatid: msg.chat.id,
        username: userName,
        type: msgType,
        body: msgBody
    });

    var chatId = msg.chat.id;
    bot.sendMessage(chatId, 'saving..').then(function() {
        debugger;
        message.save(function (err, model, affected) {
            var msg;
            if (err) {
                msg = 'error saving';
            } else {
                msg = model.toString();
            }
            bot.sendMessage(chatId, msg);
        })
    });
});
