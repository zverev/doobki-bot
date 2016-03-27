var mongoose = require('mongoose');

var shema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    firstName: String,
    lastName: String,
    userName: String
});

shema.methods.toString = function() {
    return [
        (this.firstName || ''), (this.lastName || ''), (this.userName ? '@' + this.userName : '')
    ].join(' ');
};

module.exports = mongoose.model('User', shema);
