const Express = require('express');
const BodyParser = require('body-parser');
const CORS = require('cors');

const defaultOptions = {
  pagination: false,
  authentication: false,
  perPage: 10,
  urlKeys: false,
};

let currentOptions;
let nextID;
let testData;
let authToken;
let server;
let serverPort;

function start(port, options) {
  // reset options and test data
  reset(options);

  // set up handlers
  const app = Express();
  app.use(BodyParser.json());
  app.use(CORS());
  app.set('json spaces', 2);
  app.route('/test')
    .get(handleTestRequest)
    .post(handleTestRequest)
    .put(handleTestRequest)
    .delete(handleTestRequest);
  app.use('/api/', checkAuthentication);
  app.route('/api/tasks/')
    .get(handleListFetch)
    .post(handleObjectInsert);
  app.route('/api/tasks/:id')
    .get(handleObjectFetch)
    .put(handleObjectUpdate)
    .delete(handleObjectDelete);
  app.route('/login')
    .post(handleLogIn);
  app.route('/logout')
    .post(handleLogOut);

  // start up server
  return new Promise((resolve, reject) => {
    try {
      server = app.listen(port, resolve);
      serverPort = port;

      // break connections on shutdown
      const connections = {};
      server.on('connection', (conn) => {
        const key = conn.remoteAddress + ':' + conn.remotePort;
        connections[key] = conn;
        conn.on('close', () => {
          delete connections[key];
        });
      });
      server.destroy = function(cb) {
        server.close(cb);
        for (let key in connections) {
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
  for (let i = 1; i <= 100; i++) {
    testData.push(createTestObject());
  }
}

function find(id) {
  const object = testData.find((object) => {
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
  const id = nextID++;
  const object = Object.assign({ id }, props);
  testData.push(object);
  return object;
}

function update(id, props) {
  if (props.hasOwnProperty('id') && id !== props.id) {
    raise(400);
  }
  const object = find(id);
  Object.assign(object, props);
  return object;
}

function remove(id) {
  const newList = testData.filter((object) => {
    return (object.id !== id);
  });
  if (newList.length === testData.length) {
    raise(404);
  }
  testData = newList;
}

function createTestObject() {
  const id = nextID++;
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
  const url = getObjectURL(object);
  const newObject = { url };
  for (let name in object) {
    if (name !== 'id') {
      newObject[name] = object[name];
    }
  }
  return newObject;
}

function getPageURL(page) {
  let url = `http://localhost:${serverPort}/api/tasks/`;
  if (page > 0) {
    url += `?page=${page}`;
  }
  return url;
}

function getObjectURL(object) {
  return `http://localhost:${serverPort}/api/tasks/${object.id}/`;
}

function getAuthorizationToken(req) {
  const m = /Token (\w+)/.exec(req.headers.authorization);
  if (m) {
    return m[1];
  }
}

function checkAuthentication(req, res, done) {
  if (currentOptions.authentication) {
    const token = getAuthorizationToken(req);
    if (!token) {
      res.sendStatus(401);
    } else if (token !== authToken) {
      res.sendStatus(403);
    } else {
      done();
    }
  } else {
    done();
  }
}

function handleListFetch(req, res) {
  const page = parseInt(req.query.page) || 1;
  try {
    if (currentOptions.pagination) {
      const perPage = currentOptions.perPage;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const objects = testData.slice(start, end)
      const count = testData.length;
      const next = (end < count) ? getPageURL(page + 1) : null;
      const prev = (page > 1) ? getPageURL(page - 1) : null;
      const results = objects.map(transformObject);
      res.json({ count, next, prev, results });
    } else {
      const results = testData.map(transformObject);
      res.json(results);
    }
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleObjectFetch(req, res) {
  const id = parseInt(req.params.id);
  try {
    const object = find(id);
    const result = transformObject(object);
    res.json(result);
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleObjectInsert(req, res) {
  const props = req.body;
  try {
    const object = insert(props);
    const result = transformObject(object);
    res.json(result);
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleObjectUpdate(req, res) {
  const id = parseInt(req.params.id);
  const props = req.body;
  try {
    const object = update(id, props);
    const result = transformObject(object);
    res.json(result);
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleObjectDelete(req, res) {
  const id = parseInt(req.params.id);
  try {
    remove(id);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleLogIn(req, res) {
  const credentials = req.body;
  try {
    if (!credentials.username || !credentials.password) {
      raise(400);
    }
    if (credentials.password === 'incorrect') {
      raise(401);
    }
    authToken = Math.random().toString(16).substr(2);
    res.json({ key: authToken });
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleLogOut(req, res) {
  try {
    const token = getAuthorizationToken(req);
    if (token !== authToken) {
      raise(403);
    }
    authToken = null;
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.status || 500);
  }
}

function handleTestRequest(req, res) {
  res.json({ status: 'ok' });
}

function raise(status) {
  const err = new Error;
  err.status = status;
  throw err;
}

module.exports = {
  start,
  stop,
  reset,
  find,
  insert,
  update,
  remove,
};
