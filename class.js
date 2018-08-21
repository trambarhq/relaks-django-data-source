module.exports = function(React) {

var prototype = Object.create(React.Component.prototype);

/**
 * Set initial state of component
 */
function RelaksDjangoDataSource() {
    React.Component.call(this);
    this.requests = [];
    this.state = { requests: this.requests };
}

prototype.constructor = RelaksDjangoDataSource;
prototype.constructor.prototype = prototype;

if (process.env.NODE_ENV !== 'production') {
    try {
        let propTypes = require('prop-types');

        prototype.constructor.propTypes = {
            onChange: PropTypes.func.isRequired,
        }
    } catch (err) {
    }
}
if (process.env.INCLUDE_DISPLAY_NAME) {
    prototype.constructor.displayName = 'RelaksDjangoDataSource';
}

/**
 * Don't render anything
 *
 * @return {null}
 */
prototype.render = function() {
    return null;
};

/**
 * Trigger onChange on mount
 */
prototype.componentDidMount = function() {
    this.triggerChangeEvent();
};

/**
 * Call the onChange handler
 */
prototype.triggerChangeEvent = function() {
    if (this.props.onChange) {
        this.props.onChange({ type: 'change', target: this });
    }
};

/**
 * Fetch one object at the URL.
 *
 * @param  {String} url
 * @param  {Object|undefined} options
 *
 * @return {Promise<Object>}
 */
prototype.fetchOne = function(url, options) {
    var _this = this;
    var props = {
        type: 'object',
        url: url,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        request = this.deriveRequest(props);
    }
    if (!request) {
        request = this.addRequest(props)
        request.promise = this.fetch(url).then(function(response) {
            var object = response;
            _this.updateRequest(request, { object: object });
            return object;
        });
    } else if (request.dirty)  {
        console.log('Reading dirty result set');
    }
    return request.promise;
};

/**
 * Fetch a page of objects
 *
 * @param  {String} url
 * @param  {Number} page
 * @param  {Object|undefined} options
 *
 * @return {Promise<Array>}
 */
prototype.fetchPage = function(url, page, options) {
    var _this = this;
    var props = {
        type: 'page',
        url: url,
        page: page,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        if (page > 1) {
            var qi = url.indexOf('?');
            var sep = (qi === -1) ? '?' : '&';
            url += sep + 'page=' + page;
        }
        request = this.addRequest(props)
        request.promise = this.fetch(url).then(function(response) {
            var objects = response.results;
            _this.updateRequest(request, { objects: objects });
            return objects;
        });
    } else if (request.dirty)  {
        console.log('Reading dirty result set');
    }
    return request.promise
};

/**
 * Fetch a list of objects at the given URL.
 *
 * @param  {String} url
 * @param  {Object} options
 *
 * @return {Promise<Array>}
 */
prototype.fetchList = function(url, options) {
    var _this = this;
    var props = {
        type: 'list',
        url: url,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        request = this.addRequest(props)

        // create fetch function
        var nextURL = url;
        var previousResults = [];
        var currentPage = 1;
        var currentPromise = null;
        var fetchNextPage = function() {
            if (currentPromise) {
                return currentPromise;
            }
            currentPromise = _this.fetch(nextURL).then(function(response) {
                if (response instanceof Array) {
                    // the full list is returned
                    var objects = response;
                    _this.updateRequest(request, { objects: objects });
                    objects.more = function() {};
                    return objects;
                } else if (response instanceof Object) {
                    // append retrieved objects to list
                    var objects = previousResults.concat(response.results);
                    var promise = Promise.resolve(objects)
                    _this.updateRequest(request, { objects: objects, promise: promise });

                    // attach function to results so caller can ask for more results
                    objects.more = fetchNextPage;

                    // set up the next call
                    nextURL = response.next;
                    previousResults = objects;
                    currentPromise = (nextURL) ? null : promise;

                    // inform parent component that more data is available
                    if (currentPage++ > 1) {
                        _this.triggerChangeEvent();
                    }
                    return objects;
                }
            }).catch(function(err) {
                currentPromise = null;
                throw err;
            });
            return currentPromise;
        };

        // call it for the first page
        request.promise = fetchNextPage();
    } else if (request.dirty)  {
        console.log('Reading dirty result set');
    }
    return request.promise;
};

/**
 * Fetch multiple JSON objects. If partial is specified, then immediately
 * resolve with cached results when there're sufficient numbers of objects.
 * An onChange will be trigger once the full set is retrieved.
 *
 * @param  {Array<String>} urls
 * @param  {Object} options
 *
 * @return {Promise<Object>}
 */
prototype.fetchMultiple = function(urls, options) {
    // see which ones are cached already
    var _this = this;
    var results = {};
    var cached = 0;
    var fetchOptions = {};
    for (var name in options) {
        if (name !== 'partial') {
            fetchOptions[name] = options[name];
        }
    }
    var promises = urls.map(function(url) {
        var request = _this.findRequest({ url: url, list: false });
        if (request && request.result) {
            results[url] = request.result;
            cached++;
        } else {
            return _this.fetchOne(url, fetchOptions);
        }
    });

    // wait for the compvare set to arrive
    var compvareSetPromise;
    if (cached < urls.length) {
        compvareSetPromise = Promise.all(promises).then(function(objects) {
            var compvareSet = {};
            urls.forEach(function(url, index) {
                compvareSet[url] = objects[index] || results[url];
            });
            return compvareSet;
        });
    }

    // see whether partial result set should be immediately returned
    var partial = (options && options.partial !== undefined) ? options.partial : false;
    var minimum;
    if (typeof(partial) === 'number') {
        if (partial < 1.0) {
            minimum = urls.length * partial;
        } else {
            minimum = partial;
        }
    } else if (partial) {
        minimum = 1;
    } else {
        minimum = urls.length;
    }
    if (cached < minimum && compvareSetPromise) {
        return compvareSetPromise;
    } else {
        // return partial set then fire change event when compvare set arrives
        if (compvareSetPromise) {
            compvareSetPromise.then(function() {
                _this.triggerChangeEvent();
            });
        }
        return Promise.resolve(results);
    }
};

/**
 * Fetch JSON object at URL
 *
 * @param  {String} url
 *
 * @return {Promise<Object>}
 */
prototype.fetch = function(url) {
    return fetch(url).then(function(response) {
        return response.json();
    });
};

/**
 * Insert an object into remote database
 *
 * @param  {String} dirURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.insertOne = function(dirURL, object) {
    return this.insertMultiple(dirURL, [ object ]).then((insertedObjects) => {
        return insertedObjects[0];
    });
};

/**
 * Insert multiple objects into remote database
 *
 * @param  {String} dirURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
prototype.insertMultiple = function(dirURL, objects) {
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.insert(dirURL, objects[i]));
    }
    var _this = this;
    return Promise.all(promises).then(function(insertedObjects) {
        // sort the newly created objects
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, dirURL)) {
                    var newObjects = runHook(request, 'afterInsert', insertedObjects);
                    if (newObjects !== false) {
                        if (newObjects) {
                            request.objects = newObjects;
                            request.promise = Promise.resolve(newObjects);
                        } else {
                            // default behavior:
                            // force reload from server
                            request.dirty = true;
                        }
                        changed = true;
                    }
                }
            }
            return true;
        });
        _this.updateRequestsIfChanged(requests, changed);
        return insertedObjects;
    });
};

prototype.insert = function(dirURL, object) {
    var options = {
        method: 'POST',
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    };
    return fetch(dirURL, options).then(function(response) {
        return response.json();
    });
};

/**
 * Update an object
 *
 * @param  {String} dirURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.updateOne = function(dirURL, object) {
    return this.updateMultiple(dirURL, [ object ]).then((results) => {
        return results[0];
    });
};

/**
 * Save multiple objects
 *
 * @param  {String} dirURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
prototype.updateMultiple = function(dirURL, objects) {
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.update(dirURL, objects[i]));
    }
    var _this = this;
    return Promise.all(promises).then(function(updatedObjects) {
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            if (request.type === 'object') {
                if (matchDirectoryURL(request.url, dirURL)) {
                    var updatedObject = findObject(updatedObjects, request.object);
                    if (updatedObject) {
                        var newObject = runHook(request, 'afterUpdate', updatedObject);
                        if (newObject) {
                            request.object = newObject;
                        } else {
                            // default behavior:
                            // force reload from server
                            request.dirty = true;
                        }
                        changed = true;
                    }
                }
            } else if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, dirURL)) {
                    var newObjects = runHook(request, 'afterUpdate', updatedObjects);
                    if (newObjects !== false) {
                        if (newObjects) {
                            request.objects = newObjects;
                            request.promise = Promise.resolve(newObjects);
                        } else {
                            // default behavior:
                            // force reload from server
                            request.dirty = true;
                        }
                        changed = true;
                    }
                }
            }
            return true;
        });
        _this.updateRequestsIfChanged(requests, changed);
        return updatedObjects;
    });
};

prototype.update = function(dirURL, object) {
    var url = getObjectURL(dirURL, object);
    if (!url) {
        return Promise.resolve(null);
    }
    var options = {
        method: 'PUT',
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    };
    return fetch(url, options).then(function(response) {
        return response.json();
    });
};

prototype.deleteOne = function(url, object) {
    return this.deleteMultiple(url, [ object ]).then((results) => {
        return results[0];
    });
};

prototype.deleteMultiple = function(dirURL, objects) {
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.delete(dirURL, objects[i]));
    }
    var _this = this;
    return Promise.all(promises).then(function(deletedObjects) {
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            var keep = true;
            if (request.type === 'object') {
                // remove request
                if (matchDirectoryURL(request.url, dirURL)) {
                    var deletedObject = findObject(deletedObjects, request.object);
                    if (deletedObject) {
                        var newObject = runHook(request, 'afterDelete', deletedObject);
                        if (newObject !== false) {
                            if (newObject) {
                                request.object = newObject;
                                request.promise = Promise.resolve(newObject);
                            } else {
                                // default behavior:
                                // remove request from cache
                                keep = false;
                            }
                            changed = true;
                        }
                    }
                }
            } else if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, dirURL)) {
                    var newObjects = runHook(request, 'afterDelete', deletedObjects);
                    if (newObjects !== false) {
                        if (!newObjects) {
                            // default behavior:
                            // remove matching objects from list
                            newObjects = request.objects.filter(function(object) {
                                return findObjectIndex(deletedObjects, object) === -1;
                            });
                            if (newObjects.length === request.objects.length) {
                                newObjects = null;
                            }
                        }
                        if (newObjects) {
                            request.objects = newObjects;
                            request.promise = Promise.resolve(newObjects);
                            changed = true;
                        }
                    }
                }
            }
            return keep;
        });
        _this.updateRequestsIfChanged(requests, changed);
        return deletedObjects;
    });
};

prototype.delete = function(dirURL, object) {
    var url = getObjectURL(dirURL, object);
    if (!url) {
        return Promise.resolve(null);
    }
    var options = {
        method: 'DELETE',
        mode: "cors",
        cache: "no-cache",
    };
    return fetch(url, options).then(function() {
        return object;
    });
};

/**
 * Find an existing request
 *
 * @param  {Object} props
 *
 * @return {Object|undefined}
 */
prototype.findRequest = function(props) {
    return this.requests.find(function(request) {
        return matchRequest(request, props);
    });
};

/**
 * Derive a request for an item from an existing directory request
 *
 * @param  {Object} props
 *
 * @return {Object|undefined}
 */
prototype.deriveRequest = function(props) {
    var object;
    var dirURL = getDirectoryURL(props.url);
    this.requests.some(function(request) {
        if (request.type === 'page' || request.type === 'list') {
            if (matchURL(request.url, dirURL)) {
                object = request.objects.find(function(item) {
                    return (item.url === props.url);
                });
                return !!object;
            }
        }
    });
    if (object) {
        return {
            type: 'object',
            url: props.url,
            promise: Promise.resolve(object),
            object: object
        };
    }
}

/**
 * Add a request
 *
 * @param {Object} props
 */
prototype.addRequest = function(props) {
    var request = { propmise: null };
    for (var name in props) {
        request[name] = props[name];
    }
    this.requests = [ request ].concat(this.requests);
    this.setState({ requests: this.requests });
    return request;
};

/**
 * Update a request
 *
 * @param  {Object} request
 * @param  {Object} props
 */
prototype.updateRequest = function(request, props) {
    for (var name in props) {
        request[name] = props[name];
    }
    this.requests = this.requests.slice();
    this.setState({ requests: this.requests });
};

/**
 * Update request list if it has changed and trigger change event
 *
 * @param  {Array} requests
 * @param  {Boolean} changed
 */
prototype.updateRequestsIfChanged = function(requests, changed) {
    if (changed) {
        this.requests = requests;
        this.setState({ requests: requests });
        this.triggerChangeEvent();
    }
};

return prototype.constructor;
};

function runHook(request, hookName, input) {
    var hookFunc = (request.options) ? request.options[hookName] : null;
    if (!hookFunc) {
        return;
    }
    if (request.type === 'object') {
        if (typeof(hookFunc) === 'string') {
            switch (hookFunc) {
                case 'replace': hookFunc = replaceObject; break;
                default: throw new Error('Unknown hook name: ' + hookFunc)
            }
        }
        return hookFunc(request.object, input);
    } else if (request.type === 'page' || request.type === 'list') {
        input = input.filter(Boolean);
        sortObjects(input);
        if (typeof(hookFunc) === 'string') {
            switch (hookFunc) {
                case 'replace': hookFunc = replaceObjects; break;
                case 'unshift': hookFunc = unshiftObjects; break;
                case 'push': hookFunc = pushObjects; break;
                default: throw new Error('Unknown hook name: ' + hookFunc)
            }
        }
        return hookFunc(request.objects, input);
    }
}

function replaceObject(object, newObject) {
    return newObject;
}

function replaceObjects(objects, newObjects) {
    return objects.map(function(object) {
        return findObject(newObjects, object) || object;
    });
}

function unshiftObjects(objects, newObjects) {
    objects = objects.slice();
    newObjects.forEach(function(object) {
        objects.unshift(object);
    });
    return objects;
}

function pushObjects(objects, newObjects) {
    objects = objects.slice();
    newObjects.forEach(function(object) {
        objects.push(object);
    });
    return objects;
}

function matchRequest(request, props) {
    for (var name in props) {
        if (request[name] !== props[name]) {
            if (name === 'options') {
                if (!matchOptions(request[name], props[name])) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

function matchOptions(options1, options2) {
    for (var name in options1) {
        var option1 = options1[name];
        var option2 = options2[name];
        if (option1 !== option2) {
            if (typeof(option1) === 'function' && typeof(option2) === 'function') {
                if (option1.toString() !== option2.toString()) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

function getDirectoryURL(url) {
    var ei = url.lastIndexOf('/');
    if (ei === url.length - 1) {
        ei = url.lastIndexOf('/', ei - 1);
    }
    if (ei !== -1) {
        return url.substr(0, ei + 1);
    }
}

function getObjectURL(dirURL, object) {
    if (dirURL && object.id) {
        var lc = dirURL.charAt(dirURL.length - 1);
        var sep = (lc !== '/') ? '/' : '';
        return dirURL + sep + object.id + '/';
    } else if (object.url) {
        return object.url;
    }
}

function matchURL(url1, url2) {
    var qi = url1.lastIndexOf('?');
    if (qi !== -1) {
        url1 = url1.substr(0, qi);
    }
    return (url1 === url2);
}

function matchDirectoryURL(url1, url2) {
    var dirURL1 = getDirectoryURL(url1);
    return matchURL(dirURL1, url2);
}

function findObjectIndex(list, object) {
    var keyA = object.id || object.url;
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        if (obj) {
            var keyB = obj.id || obj.url;
            if (keyA === keyB) {
                return i;
            }
        }
    }
    return -1;
}

function findObject(list, object) {
    var index = findObjectIndex(list, object);
    if (index !== -1) {
        return list[index];
    }
}

function sortObjects(list) {
    list.sort(function(a, b) {
        var keyA = a.id || a.url;
        var keyB = b.id || b.url;
        if (keyA < keyB) {
            return -1;
        } else if (keyA > keyB) {
            return +1;
        } else {
            return 0;
        }
    });
}
