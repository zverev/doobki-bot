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
                bot.sendMessage(userId, text);
            });
        }
    });
});

bot.on('text', function(msg) {
    var fromId = msg.from.id;
    checkUser(msg).then(function() {
        return saveMessage(msg);
    }).then(function() {
        // TODO: log ok
        if (isStartMessage(msg.text)) {
            bot.sendMessage(fromId, config.messages.ok);
        } else if (getMemeMessageFromCommand(msg.text)) {
            debugger;
            if (fromId === config.telegram.masterUserId) {
                addMeme(getMemeMessageFromCommand(msg.text)).then(function() {
                    bot.sendMessage(fromId, config.messages.ok);
                }, function() {
                    bot.sendMessage(fromId, config.messages.error);
                });
            } else {
                bot.sendMessage(fromId, config.messages.accessDenied);
            }
        } else if (isMayMessage(msg.text)) {
            bot.sendMessage(fromId, createMayMessage());
        } else {
            getRandomMeme().then(function(meme) {
                bot.sendMessage(fromId, meme);
            })
        }
    }, function(err) {
        bot.sendMessage(fromId, 'error :(');
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
