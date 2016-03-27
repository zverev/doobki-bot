var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.js');

var MessageModel = require('./db.js').MessageModel;

// Setup polling way
var bot = new TelegramBot(config.telegram.token, {
    polling: true
});

// Any kind of message
bot.on('message', function(msg) {
    // debugger;
    var userName = [
        (msg.from.first_name || ''),
        (msg.from.last_name || ''),
        (msg.from.username ? '@' + msg.from.username : '')
    ].join(' ');
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
        message.save(function(err, model, affected) {
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
