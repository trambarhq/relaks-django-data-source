var Express = require('express');
var BodyParser = require('body-parser');
var CORS = require('cors');

var server;

exports.start = function(port) {
    var app = Express();
    app.use(BodyParser.json());
    app.use(CORS());
    app.set('json spaces', 2);
    app.route('/test')
        .get(handleTestRequest)
        .post(handleTestRequest)
        .put(handleTestRequest)
        .delete(handleTestRequest);

    return new Promise((resolve, reject) => {
        try {
            server = app.listen(port, resolve);

            // break connections on shutdown
            var connections = {};
            server.on('connection', function(conn) {
                var key = conn.remoteAddress + ':' + conn.remotePort;
                connections[key] = conn;
                conn.on('close', function() {
                    delete connections[key];
                });
            });
            server.destroy = function(cb) {
                server.close(cb);
                for (var key in connections) {
                    connections[key].destroy();
                }
            };
        } catch (err) {
            reject(err);
        }
    });
}

exports.stop = function() {
    return new Promise((resolve, reject) => {
        if (server) {
            server.destroy(resolve);
        }
    });
}

function handleTestRequest(req, res) {
    res.json({ status: 'ok' });
}
