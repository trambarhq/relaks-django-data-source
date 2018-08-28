import Server from 'karma-server-side';

var serverProxy = {
    start: function(port) {
        return Server.run(port, function(port) {
            var TestServer = serverRequire('./test/lib/test-server-node');
            return TestServer.start(port);
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
