var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.js');
var utils = require('./utils.js');

var TextMessageModel = require('./TextMessageModel.js');
var UserModel = require('./UserModel.js');

// Setup polling way
var bot = new TelegramBot(config.telegram.token, {
    polling: true
});

bot.on('text', function(msg) {
    var fromId = msg.from.id;
    checkUser(msg).then(function() {
        return saveMessage(msg);
    }).then(function() {
        // TODO: log ok
        bot.sendMessage(fromId, '⚡️👌');
    }, function(err) {
        bot.sendMessage(fromId, 'error :(');
    });
});

function checkUser(msg) {
    var fromId = msg.from.id;
    return new Promise(function (resolve, reject) {
        UserModel.find({}, function (err, collection) {
            var users = utils.createHash(collection, 'id');
            if (!users[fromId]) {
                var user = new UserModel({
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name,
                    userName: msg.from.username,
                    id: fromId
                });

                user.save(function (err, model, affected) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            }
            resolve();
        })
    })
}

function saveMessage(msg) {
    return new Promise(function(resolve, reject) {
        var message = new TextMessageModel({
            userId: msg.from.id,
            chatId: msg.chat.id,
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
