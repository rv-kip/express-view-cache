var vows = require('vows'),
    assert = require('assert'),
    AdapterMemory = require('./../lib/adapterMemory.js'),
    AdapterMemJS = require('./../lib/adapterMemJS.js'),
    AdapterRedis = require('./../lib/adapterRedis.js');

vows.describe('Redis Adapters tests').addBatch({
    'Redis Adapter' : {
        topic: new AdapterRedis(),
        'Module should have get method': function (adapter) {
            assert.isFunction(adapter.get, 'adapter.get(key,cb) is not a function!');
        },
        'Module should have a set method': function (adapter) {
            assert.isFunction(adapter.set, 'adapter.set(key,value,cb,ttl) is not a function!');
        },
        'When setting a value'  : {
            topic: function (adapter) {
                adapter.set('key1', 'key1value', this.callback, 1000);
            },
            'It should save value': function (err, result) {
                assert.isNull(err);
                assert.ok(result);
            }
        },
        "When getting a value": {
            topic: function (adapter) {
                adapter.get('key1', this.callback);
            },
            "It should get value": function (err, result) {
                assert.isNull(err);
                assert.strictEqual(result, 'key1value');
            }
        },
        "When getting a value after 2 seconds": {
            topic: function (adapter) {
                var t = this;
                setTimeout(function () {
                    adapter.get('key1', t.callback);
                }, 2000);
            },
            "It should get NO value": function (err, result) {
                assert.isNull(err);
                assert.isNull(result);
            }
        }
    }
}).export(module);