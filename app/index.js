var mongoose = require('mongoose');
var config = require('./config.js');

require('./telegram.js');
require('./web.js');

var connectionString = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/propanebot';
mongoose.connect(connectionString, {
    user: config.mongodb.username,
    pass: config.mongodb.password
});
