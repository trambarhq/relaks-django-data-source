var Express = require('express');
var BodyParser = require('body-parser');
var CORS = require('cors');

module.exports = {
    start,
    stop,
    reset,
};

var server;

function start(port) {
    // restart options and test data
    reset();

    // set up handlers
    var app = Express();
    app.use(BodyParser.json());
    app.use(CORS());
    app.set('json spaces', 2);
    app.route('/test')
        .get(handleTestRequest)
        .post(handleTestRequest)
        .put(handleTestRequest)
        .delete(handleTestRequest);
    app.route('/api/tasks/')
        .get(handleListFetch)
        .post(handleObjectInsert);
    app.route('/api/tasks/:id')
        .get(handleObjectFetch)
        .put(handleObjectUpdate)
        .delete(handleObjectDelete);

    // start up server
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

function stop() {
    return new Promise((resolve, reject) => {
        if (server) {
            server.destroy(resolve);
        }
    });
}

function reset(options) {
    currentOptions = Object.assign({}, defaultOptions, options);
    nextId = 1;
    testData = [];
    for (var i = 1; i < 100; i++) {
        testData.push(createTestObject());
    }
}

var defaultOptions = {
    paginated: false,
    perPage: 10,
    urlKeys: false,
};
var currentOptions;
var nextId;
var testData;

function createTestObject() {
    var id = nextId++;
    return {
        id: id,
        title: `Task #${id}`,
        description: `Drink ${id} bottle${id === 1 ? '' : 's'} of beer`,
        category: 'drinking'
    };
}

function handleListFetch(req, res) {

}

function handleObjectFetch(req, res) {
    var id = parseInt(req.params.id);
    var object = testData.find((object) => {
        return (object.id === id);
    });
    if (object) {
        res.json(object);
    } else {
        res.sendStatus(404);
    }
}

function handleObjectInsert(req, res) {

}

function handleObjectUpdate(req, res) {

}

function handleObjectDelete(req, res) {

}

function handleTestRequest(req, res) {
    res.json({ status: 'ok' });
}
