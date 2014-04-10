var vows = require('vows'),
    assert = require('assert'),
    AdapterMemory = require('./../lib/adapterMemory.js');

vows.describe('Memory Adapters tests').
    addBatch({
        "Memory Adapter" : {
            topic: new AdapterMemory(),
            "Module should have get and set methods": function (adapter) {
                assert.isFunction(adapter.get, 'adapter.get(key,cb) is not a function!');
                assert.isFunction(adapter.set, 'adapter.set(key,value,cb,ttl) is not a function!');
            },
            'When setting a value with 1 second expiration' : {
                topic: function (adapter) {
                    adapter.set('key1', 'key1value', this.callback, 1000);
                },
                "It should save value": function (err, result) {
                    assert.isNull(err);
                    assert.ok(result);
                }
            },
            'When getting a value' : {
                topic: function (adapter) {
                    adapter.get('key1', this.callback);
                },
                "It should get value": function (err, result) {
                    assert.isNull(err);
                    assert.strictEqual(result, 'key1value');
                }
            },
            'When getting after 2 seconds' : {
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
    }
).export(module);