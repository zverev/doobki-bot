var mongoose = require('mongoose');

var shema = new mongoose.Schema({
    from: Number,
    to: Number,
    chat: Number,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

shema.methods.toString = function () {
    return this.body;
};

module.exports = mongoose.model('TextMessage', shema);
