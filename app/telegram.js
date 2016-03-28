var TelegramBot = require('node-telegram-bot-api');
var moment = require('moment');
moment.locale('ru');

var config = require('./config.js');
var utils = require('./utils.js');
var Timer = require('./Timer.js');

var TextMessageModel = require('./TextMessageModel.js');
var UserModel = require('./UserModel.js');
var MemeModel = require('./MemeModel.js');

var timer = new Timer();

// Setup polling way
var bot = new TelegramBot(config.telegram.token, {
    polling: true
});

timer.on('hour', function() {
    UserModel.find({}, function(err, usersCollection) {
        debugger;
        if (err) {
            console.log('database error', err);
        } else {
            getRandomMeme().then(function(text) {
                var userId = usersCollection[Math.floor(Math.random() * usersCollection.length)].id;
                sendMessage(text, userId, userId);
            });
        }
    });
});

bot.on('text', function(msg) {
    var fromId = msg.from.id;
    var chatId = msg.chat.id;
    checkUser(msg).then(function() {
        return saveMessage(msg.text, fromId, 0, chatId);
    }).then(function() {
        // TODO: log ok
        if (isStartMessage(msg.text)) {
            sendMessage(config.messages.ok, fromId, chatId);
        } else if (getMemeMessageFromCommand(msg.text)) {
            debugger;
            if (fromId === config.telegram.masterUserId) {
                addMeme(getMemeMessageFromCommand(msg.text)).then(function() {
                    sendMessage(config.messages.ok, fromId, chatId);
                }, function() {
                    sendMessage(config.messages.error, fromId, chatId);
                });
            } else {
                sendMessage(config.messages.accessDenied, fromId, chatId);
            }
        } else if (isMayMessage(msg.text)) {
            sendMessage(createMayMessage(), fromId, chatId);
        } else {
            getRandomMeme().then(function(meme) {
                sendMessage(meme, fromId, chatId);
            })
        }
    }, function(err) {
        sendMessage('error :(', fromId, chatId);
    });
});

function isStartMessage(text) {
    return text.trim() === '/start';
}

function isMayMessage(text) {
    return !!text.match(/(май|мая)/ig);
}

function createMayMessage() {
    return moment().to((new Date()).getFullYear() + '-05-01')
}

function getRandomMeme() {
    return new Promise(function(resolve, reject) {
        if (Math.floor(Math.random() * 6) === 0) {
            resolve('майские ' + createMayMessage());
        } else {
            MemeModel.find({}, function(err, collection) {
                if (err) {
                    reject(err);
                } else {
                    resolve(collection[Math.floor(Math.random() * collection.length)].body);
                }
            })
        }
    });
}

function getMemeMessageFromCommand(text) {
    if (text.indexOf('/addmeme') === -1 || text.trim() === '/addmeme') {
        return null;
    } else {
        return text.split(' ').splice(1).join(' ');
    }
}

function addMeme(body) {
    return new Promise(function(resolve, reject) {
        var meme = new MemeModel({
            body: body
        });

        meme.save(function(err, model, affected) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

function checkUser(msg) {
    var fromId = msg.from.id;
    return new Promise(function(resolve, reject) {
        UserModel.find({}, function(err, collection) {
            var users = utils.createHash(collection, 'id');
            if (!users[fromId]) {
                var user = new UserModel({
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name,
                    userName: msg.from.username,
                    id: fromId
                });

                user.save(function(err, model, affected) {
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

function sendMessage(msgText, toId, chatId) {
    var fromId = 0;
    saveMessage(msgText, fromId, toId, chatId).then(function() {
        bot.sendMessage(toId, msgText);
    }, function() {
        bot.sendMessage(config.telegram.masterUserId, 'error delivering \'' + msgText + '\' to ' + toId);
    })
}

function saveMessage(msgText, fromId, toId, chatId) {
    return new Promise(function(resolve, reject) {
        var message = new TextMessageModel({
            from: fromId,
            to: toId,
            chat: chatId || fromId,
            body: msgText
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

function defaultMessageHandler(type, msg) {
    var fromId = msg && msg.from && msg.from.id || -1;
    var chatId = msg && msg.chat && msg.chat.id || -1;
    checkUser(msg).then(function() {
        return saveMessage(type, fromId, 0, chatId);
    }).then(function() {
        sendMessage(config.messages.unknownMessage, fromId, chatId);
    });
}

bot.on('audio', function(msg) {
    defaultMessageHandler('audio', msg)
});
bot.on('document', function(msg) {
    defaultMessageHandler('document', msg)
});
bot.on('photo', function(msg) {
    defaultMessageHandler('photo', msg)
});
bot.on('sticker', function(msg) {
    defaultMessageHandler('sticker', msg)
});
bot.on('video', function(msg) {
    defaultMessageHandler('video', msg)
});
bot.on('voice', function(msg) {
    defaultMessageHandler('voice', msg)
});
bot.on('contact', function(msg) {
    defaultMessageHandler('contact', msg)
});
bot.on('location', function(msg) {
    defaultMessageHandler('location', msg)
});
bot.on('new_chat_participant', function(msg) {
    defaultMessageHandler('new_chat_participant', msg)
});
bot.on('left_chat_participant', function(msg) {
    defaultMessageHandler('left_chat_participant', msg)
});
bot.on('new_chat_title', function(msg) {
    defaultMessageHandler('new_chat_title', msg)
});
bot.on('new_chat_photo', function(msg) {
    defaultMessageHandler('new_chat_photo', msg)
});
bot.on('delete_chat_photo', function(msg) {
    defaultMessageHandler('delete_chat_photo', msg)
});
bot.on('group_chat_created', function(msg) {
    defaultMessageHandler('group_chat_created', msg)
});
