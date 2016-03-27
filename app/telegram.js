var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.js');

var TextMessageModel = require('./TextMessageModel.js');

// Setup polling way
var bot = new TelegramBot(config.telegram.token, {
    polling: true
});

bot.on('text', function(msg) {
    var fromId = msg.from.id;
    bot.sendMessage(fromId, 'saving..');
    saveMessage(msg).then(function () {
        bot.sendMessage(fromId, 'ok!');
    }, function (err) {
         bot.sendMessage(fromId, 'error :(');
    })
});

function saveMessage(msg) {
    return new Promise(function(resolve, reject) {
        var message = new TextMessageModel({
            userid: msg.from.id,
            chatid: msg.chat.id,
            type: 'text',
            body: msg.text
        });

        message.save(function(err, model, affected) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getUsername(msg) {
    return [
        (msg.from.first_name || ''), (msg.from.last_name || ''), (msg.from.username ? '@' + msg.from.username : '')
    ].join(' ');
}
