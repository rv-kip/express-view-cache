var adapterMemory = require('./lib/adapterMemory.js'),
    adapterMemJS = require('./lib/adapterMemJS.js');

// Caching middleware for Express framework
// details are here https://github.com/vodolaz095/express-view-cache

module.exports=function(invalidateTimeInMilliseconds, parameters, logger){
    // set up a faux logger if one isn't provided
    if (!logger) {
        logger = {info: console.log};
    }

    if (!invalidateTimeInMilliseconds || isNaN(invalidateTimeInMilliseconds)) {
        invalidateTimeInMilliseconds = 60 * 1000; //1 minute
    }

    if (parameters && parameters.driver) {
        switch (parameters.driver) {
            case 'memjs':
                cache = adapterMemJS;
                break;
            case 'redis':
                cache = require('./lib/adapterRedis.js');
                break;
            default :
                cache = adapterMemory;
        }
    } else {
        cache = adapterMemory;
    }

    return function(request,response,next){
        if(parameters && parameters.type){
            response.type(parameters.type);
        }
        if (request.method == 'GET') {
            cache.get(request.originalUrl,function(err,value){
                if(value){
                    logger.info(parameters.driver + ' cache READ HIT: ' + request.originalUrl);
                    response.header('Cache-Control', "public, max-age="+Math.floor(invalidateTimeInMilliseconds/1000)+", must-revalidate");
                    response.send(value);
                    return true;
                } else {
                    //http://stackoverflow.com/questions/13690335/node-js-express-simple-middleware-to-output-first-few-characters-of-response?rq=1
                    var end = response.end;
                    response.end = function(chunk, encoding){
                        response.end = end;
                        response.on('finish',function(){
                            cache.set(request.originalUrl, chunk, function(err,result){
                                if(err) {
                                    logger.error(err);
                                    throw err;
                                }
                                if(result){
                                    logger.info(parameters.driver + ' cache WRITE: ' +request.originalUrl);
                                } else {
                                    logger.error(parameters.driver + ' cache ERROR: ' + request.originalUrl);
                                }
                            },invalidateTimeInMilliseconds);
                        });
                        response.header('Cache-Control', "public, max-age="+Math.floor(invalidateTimeInMilliseconds/1000)+", must-revalidate");
                        response.end(chunk, encoding);
                    };
                    return next();
                }
            });
        } else {
            return next();
        }
    };
};
