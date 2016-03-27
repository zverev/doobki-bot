var mongoose = require('mongoose');
var config = require('./config.js');

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
};

var MessageModel = mongoose.model('Message', messageSchema);

var connectionString = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/propanebot';
mongoose.connect(connectionString, {
    user: config.mongodb.username,
    pass: config.mongodb.password
});

module.exports = {
    MessageModel: MessageModel
};
