import Server from 'karma-server-side';

var serverProxy = {
    start: function(port, options) {
        return Server.run(port, options || {}, function(port, options) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.start(port, options);
        });
    },
    stop: function() {
        return Server.run(function() {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.stop();
        });
    },
    reset: function(options) {
        return Server.run(options || {}, function(options) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.reset(options);
        });
    },
    insert: function(props) {
        return Server.run(props, function(props) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.insert(props);
        });
    },
    update: function(id, props) {
        return Server.run(id, props, function(id, props) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.update(id, props);
        });
    },
    remove: function(id) {
        return Server.run(id, function(id) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.remove(id);
        });
    },
};

export {
    serverProxy as default
};
