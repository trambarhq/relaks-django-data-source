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
};

export {
    serverProxy as default
};
