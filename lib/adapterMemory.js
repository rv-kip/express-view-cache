//A memory cache client for nodeJS
//It leaks memory and not scalable, DO NOT USE IN PRODUCTION!

//2 methods are utilized
//  .get(key,function(err,value){})
//  .set(key,value,function(err,resultOfSaving){},timeToLiveInMilliseconds)


function adapterMemory(logger) {
    this.storage = {};
    if (!logger) {
        logger = require('./dummy_logger.js');
    }
    this.logger = logger;
}

adapterMemory.prototype.get = function get (key, callback) {
    var logger = this.logger;
    if (this.storage[key]) {
        var now = new Date().getTime();
        if (this.storage[key].expireAt > now) {
            callback(null, this.storage[key].value);
        } else {
            delete this.storage[key];
            this.storage[key] = null;
            callback(null, null);
        }
    } else {
        callback(null, null);
    }
};

adapterMemory.prototype.set = function set (key, value, callback, ttlInMs) {
    var expireAt;
    if (ttlInMs && /^\d+$/.test(ttlInMs)) {
        expireAt = new Date().getTime() + ttlInMs;
    } else {
        expireAt = new Date().getTime() + 60000;
    }
    this.storage[key] = {'value':value, 'expireAt':expireAt};
    callback(null, true);
};

module.exports = adapterMemory;