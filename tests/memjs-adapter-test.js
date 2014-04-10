var vows = require('vows'),
    assert = require('assert'),
    AdapterMemJS = require('./../lib/adapterMemJS.js');

vows.describe('Memcached Adapter test').addBatch({
    "Memcached Adapter": {
        topic: new AdapterMemJS(),
        "Module should have get and set methods": function (adapterMemJS) {
            assert.isFunction(adapterMemJS.get, 'adapterMemJS.get(key,cb) is not a function!');
            assert.isFunction(adapterMemJS.set, 'adapterMemJS.set(key,value,cb,ttl) is not a function!');
        },
        // Execute in order: save then get
        'When setting a value'  : {
            topic: function (adapter) {
                adapter.set('key1', 'key1value', this.callback, 1);
            },
            'It should save value': function (err, result) {
                assert.isNull(err);
                assert.ok(result);
            },
            "After saving, when getting a value": {
                topic: function (result, adapter) {
                    adapter.get('key1', this.callback);
                },
                "It should get value": function (err, result) {
                    assert.isNull(err);
                    // Note: assert.strictEqual causes some strange behavior
                    // maybe because result is a buffer. Dunno
                    assert.equal(result, 'key1value');
                }
            },
            "After saving, When getting a value after 2 seconds": {
                topic: function (result, adapter) {
                    var self = this;
                    setTimeout(function () {
                        adapter.get('key1', self.callback);
                    }, 2000);
                },
                "It should get NO value": function (err, result) {
                    assert.isNull(err);
                    assert.isNull(result);
                }
            }
        }
    }
}).export(module);