module.exports = function(React) {

var prototype = Object.create(React.Component.prototype);

/**
 * Set initial state of component
 */
function RelaksDjangoDataSource() {
    React.Component.call(this);
    this.requests = [];
    this.authentications = [];
    this.state = {
        requests: this.requests,
        authentications: this.authentications,
    };
}

prototype.constructor = RelaksDjangoDataSource;
prototype.constructor.prototype = prototype;

if (process.env.NODE_ENV !== 'production') {
    try {
        let propTypes = require('prop-types');

        prototype.constructor.propTypes = {
            baseURL: PropTypes.func,
            refreshInterval: PropTypes.number,

            onChange: PropTypes.func,
            onAuthentication: PropTypes.func,
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
    this.scheduleExpirationCheck(!!this.props.refreshInterval);
};

/**
 * Enable or disable expiration check
 *
 * @param  {[type]} nextProps
 *
 * @return {[type]}
 */
prototype.componentWillReceiveProps = function(nextProps) {
    if (this.props.refreshInterval !== nextProps.refreshInterval) {
        this.scheduleExpirationCheck(!!nextProps.refreshInterval);
    }
};

/**
 * Stop expiration checks on unmount
 */
prototype.componentWillUnmount = function() {
    this.scheduleExpirationCheck(false);
};

/**
 * Add baseURL to relative URL
 *
 * @param  {String} url
 *
 * @return {String}
 */
prototype.resolveURL = function(url) {
    if (typeof(url) !== 'string') {
        return url;
    }
    var baseURL = this.props.baseURL;
    if (!baseURL || /^https?:/.test(url)) {
        return url;
    }
    if (baseURL.charAt(baseURL.length - 1) === '/') {
        baseURL = baseURL.substr(0, baseURL.length - 1);
    }
    if (url.charAt(0) !== '/') {
        url = '/' + url;
    }
    return baseURL + url;
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
    var fullURL = this.resolveURL(url);
    var props = {
        type: 'object',
        url: fullURL,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        request = this.deriveRequest(props);
    }
    if (!request) {
        request = props;
        request.promise = this.fetch(fullURL).then(function(response) {
            var object = response;
            _this.updateRequest(request, {
                object: object,
                retrievalTime: getTime(),
            });
            return object;
        });
        this.addRequest(request);
    } else if (request.dirty)  {
        this.refreshOne(request);
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
    var fullURL = this.resolveURL(url);
    var props = {
        type: 'page',
        url: url,
        page: page,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        var pageURL = attachPageNumber(fullURL, page);
        request = props;
        request.promise = this.fetch(pageURL).then(function(response) {
            var objects = response.results;
            _this.updateRequest(request, {
                objects: objects,
                retrievalTime: getTime(),
            });
            return objects;
        });
        this.addRequest(request)
    } else if (request.dirty)  {
        this.refreshPage(request);
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
    var fullURL = this.resolveURL(url);
    var props = {
        type: 'list',
        url: fullURL,
        options: options,
    };
    var request = this.findRequest(props);
    if (!request) {
        request = props;
        request.promise = this.fetchNextPage(request, true);
        this.addRequest(request);
    } else if (request.dirty)  {
        this.refreshList(request);
    }
    return request.promise;
};

/**
 * Return what has been fetched. Used by fetchList().
 *
 * @param  {Object} request
 *
 * @return {Promise<Array>}
 */
prototype.fetchNoMore = function(request) {
    return request.promise;
};

/**
 * Initiate fetching of the next page. Used by fetchList().
 *
 * @param  {Object} request
 * @param  {Boolean} initial
 *
 * @return {Promise<Array>}
 */
prototype.fetchNextPage = function(request, initial) {
    if (request.nextPromise) {
        return request.nextPromise;
    }
    var _this = this;
    var nextURL = (initial) ? request.url : request.nextURL;
    var nextPromise = this.fetch(nextURL).then(function(response) {
        if (response instanceof Array) {
            // the full list is returned
            var objects = response;
            _this.updateRequest(request, {
                objects: objects,
                retrievalTime: getTime(),
                nextPromise: null,
            });
            objects.more = _this.fetchNoMore.bind(_this, request);
            return objects;
        } else if (response instanceof Object) {
            // append retrieved objects to list
            var objects = appendObjects(request.objects, response.results);
            _this.updateRequest(request, {
                objects: objects,
                promise: nextPromise,
                retrievalTime: (initial) ? getTime() : request.retrievalTime,
                nextURL: response.next,
                nextPage: (request.nextPage || 1) + 1,
                nextPromise: null,
            });

            // attach function to results so caller can ask for more results
            if (request.nextURL) {
                objects.more = _this.fetchNextPage.bind(_this, request, false);
            } else {
                objects.more = _this.fetchNoMore.bind(_this, request);
            }

            // inform parent component that more data is available
            if (!initial) {
                _this.triggerChangeEvent();
            }
            return objects;
        }
    }).catch(function(err) {
        if (!initial) {
            _this.updateRequest(request, { nextPromise: null });
        }
        throw err;
    });
    if (!initial) {
        _this.updateRequest(request, { nextPromise });
    }
    return nextPromise;
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
        var fullURL = _this.resolveURL(url);
        var request = _this.findRequest({ url: fullURL, list: false });
        if (request && request.result) {
            results[url] = request.result;
            cached++;
        } else {
            return _this.fetchOne(fullURL, fetchOptions);
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
 * @param  {String} fullURL
 *
 * @return {Promise<Object>}
 */
prototype.fetch = function(fullURL) {
    return fetch(fullURL).then(function(response) {
        return response.json();
    });
};

/**
 * Reperform an request for an object, triggering an onChange event if the
 * object has changed.
 *
 * @param  {Object} request
 */
prototype.refreshOne = function(request) {
    if (request.refreshing) {
        return;
    }
    console.log('Refreshing object', request);
    this.updateRequest(request, { refreshing: true });

    var _this = this;
    var retrievalTime = getTime();
    this.fetch(request.url).then(function(response) {
        var object = response;
        var changed = true;
        if (matchObject(object, request.object)) {
            object = request.object;
            changed = false;
        }
        _this.updateRequest(request, {
            object: object,
            promise: Promise.resolve(object),
            retrievalTime: retrievalTime,
            refreshing: false,
            dirty: false,
        });
        if (changed) {
            _this.triggerChangeEvent();
        }
    }).catch(function(err) {
        _this.updateRequest(request, { refreshing: false });
    });
};

/**
 * Reperform an request for a page of objects, triggering an onChange event if
 * the list is different from the one fetched previously.
 *
 * @param  {Object} request
 */
prototype.refreshPage = function(request) {
    if (request.refreshing) {
        return;
    }
    console.log('Refreshing page', request.url);
    this.updateRequest(request, { refreshing: true });

    var _this = this;
    var retrievalTime = getTime();
    var pageURL = attachPageNumber(request.url, request.page);
    this.fetch(pageURL).then(function(response) {
        var objects = response.results;
        var changed = true;
        if (replaceIdentificalObjects(objects, request.objects)) {
            objects = request.objects;
            changed = false;
        }
        _this.updateRequest(request, {
            objects: objects,
            promise: Promise.resolve(objects),
            retrievalTime: retrievalTime,
            refreshing: false,
            dirty: false,
        })
        if (changed) {
            _this.triggerChangeEvent();
        }
    }).catch(function(err) {
        _this.updateRequest(request, { refreshing: false });
    });
};

/**
 * Reperform an request for a list of objects, triggering an onChange event if
 * the list is different from the one fetched previously.
 *
 * @param  {Object} request
 */
prototype.refreshList = function(request) {
    if (request.refreshing) {
        return;
    }
    console.log('Refreshing list', request.url);
    this.updateRequest(request, { refreshing: true });

    var _this = this;
    if (request.nextPage) {
        // updating paginated list
        // wait for any call to more() to finish first
        this.waitForNextPage(request).then(function() {
            // suppress fetching of additional pages for the time being
            var oldObjects = request.objects;
            var morePromise, moreResolve, moreReject;
            var fetchMoreAfterward = function() {
                if (!morePromise) {
                    morePromise = new Promise(function(resolve, reject) {
                        moreResolve = resolve;
                        moreReject = reject;
                    });
                }
                return morePromise;
            };
            oldObjects.more = fetchMoreAfterward;

            var refreshedObjects;
            var pageRemaining = request.nextPage - 1;
            var nextURL = request.url;

            var refreshNextPage = function() {
                return _this.fetch(nextURL).then(function(response) {
                    pageRemaining--;
                    nextURL = response.next;
                    refreshedObjects = appendObjects(refreshedObjects, response.results);
                    var objects = joinObjectLists(refreshedObjects, oldObjects);
                    var changed = true;
                    objects.more = fetchMoreAfterward;
                    if (replaceIdentificalObjects(objects, request.objects)) {
                        objects = request.objects;
                        changed = false;
                    }
                    // set request.nextURL to the URL given by the server
                    // in the event that new pages have become available
                    _this.updateRequest(request, {
                        objects: objects,
                        promise: Promise.resolve(objects),
                        nextURL: (pageRemaining === 0) ? nextURL : request.nextURL,
                    });
                    if (changed) {
                        _this.triggerChangeEvent();
                    }
                    // keep going until all pages have been updated
                    if (pageRemaining > 0 && nextURL && request.nextURL !== nextURL) {
                        return refreshNextPage();
                    }
                });
            };

            var retrievalTime = getTime();
            refreshNextPage().then(function() {
                // we're done--reenable fetching of additional pages
                if (request.nextURL) {
                    request.objects.more = _this.fetchNextPage.bind(_this, request, false);
                } else {
                    request.objects.more = _this.fetchNoMore.bind(_this, request);
                }
                // trigger it if more() had been called
                if (morePromise) {
                    request.objects.more().then(moreResolve, moreReject);
                }
                _this.updateRequest(request, {
                    retrievalTime: retrievalTime,
                    refreshing: false,
                    dirty: false,
                });
            }).catch(function(err) {
                _this.updateRequest(request, { refreshing: false });
            });
        });
    } else {
        // updating un-paginated list
        var retrievalTime = getTime();
        this.fetch(request.url).then(function(response) {
            var objects = response;
            var changed = true;
            if (replaceIdentificalObjects(objects, request.objects)) {
                objects = request.objects;
                changed = false;
            }
            objects.more = _this.fetchNoMore.bind(this, request);
            _this.updateRequest(request, {
                objects: objects,
                promise: Promise.resolve(objects),
                retrievalTime: retrievalTime,
                refreshing: false,
                dirty: false,
            });
            if (changed) {
                _this.triggerChangeEvent();
            }
        }).catch(function(err) {
            _this.updateRequest(request, { refreshing: false });
            throw err;
        });
    }
};

prototype.waitForNextPage = function(request) {
    if (request.nextPromise) {
        return request.nextPromise;
    } else {
        return Promise.resolve();
    }
}

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
    var _this = this;
    var fullDirURL = this.resolveURL(dirURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.insert(fullDirURL, objects[i]));
    }
    return Promise.all(promises).then(function(insertedObjects) {
        // sort the newly created objects
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, fullDirURL)) {
                    if (request.objects) {
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
                    } else {
                        // need to run query again, in case the dataset that's
                        // currently in flight has already become out-of-date
                        request.dirty = true;
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

prototype.insert = function(fullDirURL, object) {
    var options = {
        method: 'POST',
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    };
    return fetch(fullDirURL, options).then(function(response) {
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
    var _this = this;
    var fullDirURL = this.resolveURL(dirURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.update(fullDirURL, objects[i]));
    }
    return Promise.all(promises).then(function(updatedObjects) {
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            if (request.type === 'object') {
                if (matchDirectoryURL(request.url, fullDirURL)) {
                    if (request.object) {
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
                }
            } else if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, fullDirURL)) {
                    if (request.objects) {
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
                    } else {
                        request.dirty = true;
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

prototype.update = function(fullDirURL, object) {
    var fullURL = getObjectURL(fullDirURL, object);
    if (!fullURL) {
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
    return fetch(fullURL, options).then(function(response) {
        return response.json();
    });
};

prototype.deleteOne = function(url, object) {
    return this.deleteMultiple(url, [ object ]).then((results) => {
        return results[0];
    });
};

prototype.deleteMultiple = function(dirURL, objects) {
    var _this = this;
    var fullDirURL = this.resolveURL(dirURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.delete(fullDirURL, objects[i]));
    }
    return Promise.all(promises).then(function(deletedObjects) {
        var changed = false;
        var requests = _this.requests.filter(function(request) {
            var keep = true;
            if (request.type === 'object') {
                // remove request
                if (matchDirectoryURL(request.url, fullDirURL)) {
                    if (request.object) {
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
                }
            } else if (request.type === 'page' || request.type === 'list') {
                if (matchURL(request.url, fullDirURL)) {
                    if (request.objects) {
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
                                if (request.type === 'list') {
                                    newObjects.more = request.objects.more;
                                }
                                request.objects = newObjects;
                                request.promise = Promise.resolve(newObjects);
                                changed = true;
                            }
                        }
                    } else {
                        request.dirty = true;
                        changed = true;
                    }
                }
            }
            return keep;
        });
        _this.updateRequestsIfChanged(requests, changed);
        return deletedObjects;
    });
};

prototype.delete = function(fullDirURL, object) {
    var fullURL = getObjectURL(fullDirURL, object);
    if (!fullURL) {
        return Promise.resolve(null);
    }
    var options = {
        method: 'DELETE',
        mode: "cors",
        cache: "no-cache",
    };
    return fetch(fullURL, options).then(function() {
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
 * @param {Object} request
 */
prototype.addRequest = function(request) {
    this.requests = [ request ].concat(this.requests);
    this.setState({ requests: this.requests });
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

/**
 * Start or stop expiration checking
 *
 * @param  {Boolean} enable
 */
prototype.scheduleExpirationCheck = function(enable) {
    if (enable) {
        if (!this.expirationCheckInterval) {
            var _this = this;
            this.expirationCheckInterval = setInterval(function() {
                _this.checkExpiration();
            }, 5000);
        }
    } else {
        if (this.expirationCheckInterval) {
            this.expirationCheckInterval = clearInterval(this.expirationCheckInterval);
        }
    }
};

/**
 * Defer expiration checking for a while
 */
prototype.rescheduleExpirationCheck = function() {
    if (this.expirationCheckInterval) {
        var _this = this;
        clearInterval(this.expirationCheckInterval);
        this.expirationCheckInterval = setInterval(function() {
            _this.checkExpiration();
        }, 5000);
    }
};

/**
 * Mark requests as dirty and trigger onChange event when enough time has passed
 */
prototype.checkExpiration = function() {
    var interval = Number(this.props.refreshInterval);
    if (!interval) {
        return;
    }
    var limit = getTime(-interval);
    var changed = false;
    var requests = this.requests.filter(function(request) {
        if (!request.dirty) {
            if (request.retrievalTime < limit) {
                request.dirty = true;
                changed = true;
            }
        }
        return true;
    });
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
    if (typeof(hookFunc) === 'string') {
        switch (request.type + '::' + hookFunc) {
            case 'object::replace':
                hookFunc = replaceObject;
                break;
            case 'list::replace':
            case 'page::replace':
                hookFunc = replaceObjects;
                break;
            case 'list::unshift':
            case 'page::unshift':
                hookFunc = unshiftObjects;
                break;
            case 'list::push':
            case 'page::push':
                hookFunc = pushObjects;
                break;
            default:
                throw new Error('Unknown hook name: ' + hookFunc)
        }
    }
    if (request.type === 'object') {
        return hookFunc(request.object, input);
    } else if (request.type === 'page' || request.type === 'list') {
        // get rid of null and sort list by ID or URL
        input = input.filter(Boolean);
        sortObjects(input);
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
        if (!matchObject(request[name], props[name])) {
            return false;
        }
    }
    return true;
}

function matchObject(object1, object2) {
    if (object1 !== object2) {
        if (object1 instanceof Object && object2 instanceof Object) {
            if (object1.constructor !== object2.constructor) {
                return false;
            }
            if (object1 instanceof Array) {
                if (object1.length !== object2.length) {
                    return false;
                }
                for (var i = 0; i < object1.length; i++) {
                    if (!matchObject(object1[i], object2[i])) {
                        return false;
                    }
                }
            } else if (object1 instanceof Function) {
                if (object1.toString() !== object2.toString()) {
                    return false;
                }
            } else {
                for (var name in object1) {
                    if (!matchObject(object1[name], object2[name])) {
                        return false;
                    }
                }
                for (var name in object2) {
                    if (!(name in object1)) {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
    }
    return true;
}

function matchArray(array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        var value1 = object1[name];
        var value2 = object2[name];
        if (value1 !== value2) {

        }
    }
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

/**
 * Append the variable "page" to a URL's query, unless page equals 1.
 *
 * @param  {String} url
 * @param  {Number} page
 *
 * @return {String}
 */
function attachPageNumber(url, page) {
    if (page === 1) {
        return url;
    }
    var qi = url.indexOf('?');
    var sep = (qi === -1) ? '?' : '&';
    return sep + 'page=' + page;
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

/**
 * Find the position of an object in an array based on id or URL. Return -1 if
 * the object is not there.
 *
 * @param  {Array<Object>} list
 * @param  {Object} object
 *
 * @return {Number}
 */
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

/**
 * Find an object in an array based on ID or URL.
 *
 * @param  {[type]} list
 * @param  {[type]} object
 *
 * @return {Object|undefined}
 */
function findObject(list, object) {
    var index = findObjectIndex(list, object);
    if (index !== -1) {
        return list[index];
    }
}

/**
 * Sort a list of objects based on ID or URL
 *
 * @param  {Array<Object>} list
 */
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

/**
 * Append objects to a list, making sure duplicates aren't added
 *
 * @param  {Array<Object>} list
 * @param  {Array<Object>} objects
 *
 * @return {Array<Object>}
 */
function appendObjects(list, objects) {
    if (!list) {
        return objects;
    } else {
        objects = objects.filter(function(object) {
            return findObjectIndex(list, object) === -1;
        });
        return list.concat(objects);
    }
}

/**
 * Replace objects in newList that are identical to their counterpart in oldList.
 * Return true if newList is identical to oldList.
 *
 * @param  {Array<Object>} newList
 * @param  {Array<Object>} oldList
 *
 * @return {Boolean}
 */
function replaceIdentificalObjects(newList, oldList) {
    var unchanged = 0;
    for (var i = 0; i < newList.length; i++) {
        var oldIndex = findObjectIndex(oldList, newList[i]);
        if (oldIndex !== -1) {
            if (matchObject(newList[i], oldList[oldIndex])) {
                newList[i] = oldList[oldIndex];
                if (i === oldIndex) {
                    unchanged++;
                }
            }
        }
    }
    return (unchanged === newList.length && newList.length === oldList.length);
}

/**
 * Attach objects from an older list to a new list that's being retrieved.
 *
 * @param  {Array<Object>} newList
 * @param  {Array<Object>} oldList
 *
 * @return {Array<Object>}
 */
function joinObjectLists(newList, oldList) {
    // find point where the two list intersect
    var startIndex = 0;
    for (var i = newList.length - 1; i >= 0; i--) {
        var newObject = newList[i];
        var oldIndex = findObjectIndex(oldList, newObject);
        if (oldIndex !== -1) {
            startIndex = oldIndex + 1;
            break;
        }
    }
    // remove objects ahead of the intersection from the old list, as well
    // as any object that is present in the new list (due to change in order)
    var oldObjects = oldList.filter(function(object, index) {
        if (index >= startIndex) {
            return findObjectIndex(newList, object) === -1;
        }
    });
    return newList.concat(oldObjects);
}

function getTime(diff) {
    var date = new Date;
    if (diff) {
        date = new Date(date.getTime() + diff);
    }
    return date.toISOString();
}
