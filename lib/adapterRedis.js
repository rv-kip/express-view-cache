var redis = require('redis'),
    url = require('url');


if(process.env.redisUrl){
    var redisParameters = url.parse(process.env.redisUrl);
    if(redisParameters){
        var config = {
            port:((redisParameters.port)?(redisParameters.port):6379),
            host:((redisParameters.hostname)?(redisParameters.hostname):'localhost'),
            password:((redisParameters.auth)?(redisParameters.auth.split(":")[1]):null)
        };
    } else {
        throw new Error('Unable to parse as URL enviroment variable of redisUrl ' + process.env.redisUrl);
    }
} else {
    // Default redis config
    var config = {
        port: 6379,
        host: 'localhost',
        password: null
    };
}

var client;
try {
    client = redis.createClient(config.port,config.host);
} catch (e) {
    console.error("Could not connect to redis at ", config.host, config.port);
    throw e;
}

if(config.password){
    client.auth(config.password,function(err){
        if(err) throw err;
    });
}

// Handle Redis unavailability
client.on('error', function(e){
    console.error("Redis Adapter Error", e);
});

client.on('ready', function(e){
    console.error("Redis Adapter ready");
});

exports.set = function (key, value, callback, ttlInMs) {
    if (client.connected === true) {
        client.set('expess-view-cache-'+key,value,function(err){
            if(err){
                callback(err);
            } else {
                var ttlInSecond=Math.floor((ttlInMs/1000));
                // i know of
                // http://redis.io/commands/pexpireat
                // http://redis.io/commands/set
                //but i ASUME that user can have older versions of redis, not the 2.6.12!
                client.expire('expess-view-cache-'+key,ttlInSecond,function(err,setted){
                    callback(err,true);
                });
            }
        });
    } else {
        // Error. Redis is gone
        callback(null, false);
    }
};

exports.get = function (key, callback) {
    if (client.connected === true) {
        client.get('expess-view-cache-' + key, callback);
    } else {
        callback();
        // Error. Redis is gone
    }
};