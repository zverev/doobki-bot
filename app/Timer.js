var EventEmitter = require('events');
var util = require('util');

var tick = 60 * 60 * 1000;
// var tick = 5 * 1000;

function Timer() {
    EventEmitter.call(this);
    setInterval(this._tick.bind(this), tick);
}

util.inherits(Timer, EventEmitter);

Timer.prototype._tick = function () {
    this.emit('hour');
};

module.exports = Timer;
