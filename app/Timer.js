var EventEmitter = require('events');
var util = require('util');

function Timer() {
    EventEmitter.call(this);
    setInterval(this._tick.bind(this), 60 * 60 * 1000);
}

util.inherits(Timer, EventEmitter);

Timer.prototype._tick = function () {
    this.emit('hour');
};

module.exports = Timer;
