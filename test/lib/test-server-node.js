var Express = require('express');
var BodyParser = require('body-parser');
var CORS = require('cors');

module.exports = {
    start,
    stop,
    reset,
    find,
    insert,
    update,
    remove,
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

function find(id) {
    var object = testData.find((object) => {
        return (object.id === id);
    });
    if (!object) {
        raise(404);
    }
    return object;
}

function insert(props) {
    if (props.hasOwnProperty('id')) {
        raise(404);
    }
    var object = Object.assign({ id: nextID++ }, props);
    testData.push(object);
    return object;
}

function update(id, props) {
    if (props.hasOwnProperty('id') && id !== props.id) {
        raise(400);
    }
    var object = find(id);
    Object.assign(object, props);
    return object;
}

function remove(id) {
    var newList = testData.filter((object) => {
        return (object.id !== id);
    });
    if (newList.length === testData.length) {
        raise(404);
    }
    testData = newList;
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
    var page = parseInt(req.query.page) || 1;
    try {
        if (currentOptions.pagination) {
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
    } catch (err) {
        res.sendStatus(err.status || 500);
    }
}

function handleObjectFetch(req, res) {
    var id = parseInt(req.params.id);
    try {
        var object = find(id);
        var result = transformObject(object);
        res.json(result);
    } catch (err) {
        res.sendStatus(err.status || 500);
    }
}

function handleObjectInsert(req, res) {
    var props = req.body;
    try {
        var object = insert(props);
        var result = transformObject(object);
        res.json(result);
    } catch (err) {
        res.sendStatus(err.status || 500);
    }
}

function handleObjectUpdate(req, res) {
    var id = parseInt(req.params.id);
    var props = req.body;
    try {
        var object = update(id, props);
        var result = transformObject(object);
        res.json(result);
    } catch (err) {
        res.sendStatus(err.status || 500);
    }
}

function handleObjectDelete(req, res) {
    var id = parseInt(req.params.id);
    try {
        remove(id);
        res.sendStatus(204);
    } catch (err) {
        res.sendStatus(err.status || 500);
    }
}

function handleTestRequest(req, res) {
    res.json({ status: 'ok' });
}

function raise(status) {
    var err = new Error;
    err.status = status;
    throw err;
}
