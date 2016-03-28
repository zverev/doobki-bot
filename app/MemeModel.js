var mongoose = require('mongoose');

var shema = new mongoose.Schema({
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

shema.methods.toString = function () {
    return this.body;
};

module.exports = mongoose.model('Meme', shema);
