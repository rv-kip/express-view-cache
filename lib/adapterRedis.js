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
        var redis_key = 'expess-view-cache-' + key,
            ttlInSecond=Math.floor((ttlInMs/1000)),
            redis_version_arr = client.server_info.versions || [0,0,0];

        // Check redis version to see if "setex" is available
        if (redis_version_arr[0] <= 1) {
            // Old School: use set -> expire
            client.set(redis_key, value, function(err){
                if(err){
                    callback(err);
                } else {
                    client.expire(redis_key, ttlInSecond, function(err,setted){
                        callback(err,true);
                    });
                }
            });
        } else {
            // setex is available in Redis 2.0.0+
            client.setex(redis_key, ttlInSecond, value, function(err){
                if(err){
                    callback(err);
                } else {
                    callback(null, true);
                }
            });
        }
    } else {
        // Error. Redis is gone
        callback(null, false);
    }
};

exports.get = function (key, callback) {
    if (client.connected === true) {
        client.get('expess-view-cache-' + key, callback);
    } else {
        // Error. Redis is gone
        callback(null, null);
    }
};