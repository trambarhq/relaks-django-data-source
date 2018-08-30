var Express = require('express');
var BodyParser = require('body-parser');
var CORS = require('cors');

module.exports = {
    start,
    stop,
    reset,
};

var server;
var serverPort;

function start(port, options) {
    // reset options and test data
    reset(options);

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
            serverPort = port;

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
            server = null;
        }
    });
}

function reset(options) {
    currentOptions = Object.assign({}, defaultOptions, options);
    nextID = 1;
    testData = [];
    for (var i = 1; i <= 100; i++) {
        testData.push(createTestObject());
    }
}

var defaultOptions = {
    pagination: false,
    perPage: 10,
    urlKeys: false,
};
var currentOptions;
var nextID;
var testData;

function createTestObject() {
    var id = nextID++;
    return {
        id: id,
        title: `Task #${id}`,
        description: `Drink ${id} bottle${id === 1 ? '' : 's'} of beer`,
        category: 'drinking'
    };
}

function transformObject(object) {
    if (!currentOptions.urlKeys) {
        return object;
    }
    var url = getObjectURL(object);
    var newObject = { url };
    for (var name in object) {
        if (name !== 'id') {
            newObject[name] = object[name];
        }
    }
    return newObject;
}

function getPageURL(page) {
    var url = `http://localhost:${serverPort}/api/tasks/`;
    if (page > 0) {
        url += `?page=${page}`;
    }
    return url;
}

function getObjectURL(object) {
    return `http://localhost:${serverPort}/api/tasks/${object.id}/`;
}

function handleListFetch(req, res) {
    var objects;
    if (currentOptions.pagination) {
        var page = parseInt(req.query.page) || 1;
        var perPage = currentOptions.perPage;
        var start = (page - 1) * currentOptions.perPage;
        var end = start + currentOptions.perPage;
        var objects = testData.slice(start, end)
        var count = testData.length;
        var next = (end < count) ? getPageURL(page + 1) : null;
        var prev = (page > 1) ? getPageURL(page - 1) : null;
        var results = objects.map(transformObject);
        res.json({ count, next, prev, results });
    } else {
        var results = testData.map(transformObject);
        res.json(results);
    }
}

function handleObjectFetch(req, res) {
    var id = parseInt(req.params.id);
    var object = testData.find((object) => {
        return (object.id === id);
    });
    if (!object) {
        res.sendStatus(404);
        return;
    }
    var result = transformObject(object);
    res.json(result);
}

function handleObjectInsert(req, res) {
    var object = { id: nextID++ };
    var props = req.body;
    if (props.id !== object.id && props.hasOwnProperty('id')) {
        res.sendStatus(400);
        return;
    }
    Object.assign(object, props);
    testData.push(object);
    var result = transformObject(object);
    res.json(result);
}

function handleObjectUpdate(req, res) {
    var props = req.body;
    var id = parseInt(req.params.id);
    var object = testData.find((object) => {
        return (object.id === id);
    });
    if (!object) {
        res.sendStatus(404);
        return;
    }
    Object.assign(object, props);
    var result = transformObject(object);
    res.json(result);
}

function handleObjectDelete(req, res) {
    var id = parseInt(req.params.id);
    var newList = testData.filter((object) => {
        return (object.id !== id);
    });
    if (newList.length === testData.length) {
        res.sendStatus(404);
        return;
    }
    testData = newList;
    res.sendStatus(204);
}

function handleTestRequest(req, res) {
    res.json({ status: 'ok' });
}
