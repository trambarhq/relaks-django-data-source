var defaultOptions = {
    baseURL: '',
    refreshInterval: 0,
    authorizationKeyword: 'Token',
    abbreviatedFolderContents: false,
};

function RelaksDjangoDataSource(options) {
    this.listeners = [];
    this.queries = [];
    this.authentications = [];
    this.authorizations = [];
    this.options = {};
    for (var name in defaultOptions) {
        if (options && options[name] !== undefined) {
            this.options[name] = options[name];
        } else {
            this.options[name] = defaultOptions[name];
        }
    }
}

var prototype = RelaksDjangoDataSource.prototype;

/**
 * Initialize the component
 */
prototype.initialize = function() {
    this.startExpirationCheck();
};

/**
 * Shutdown the component
 */
prototype.shutdown = function() {
    this.stopExpirationCheck();
};

/**
 * Attach an event handler
 *
 * @param  {String} type
 * @param  {Function} handler
 */
prototype.addEventListener = function(type, handler) {
    this.listeners.push({  type: type,  handler: handler });
};

/**
 * Remove an event handler
 *
 * @param  {String} type
 * @param  {Function} handler
 */
prototype.removeEventListener = function(type, handler) {
    this.listeners = this.listeners.filter(function(listener) {
        return !(listener.type === type && listener.handler === handler);
    })
};

/**
 * Send event to event listeners, return true or false depending on whether
 * there were any listeners
 *
 * @param  {RelaksDjangoDataSourceEvent} evt
 *
 * @return {Boolean}
 */
prototype.triggerEvent = function(evt) {
    var fired = false;
    this.listeners.forEach(function(listener) {
        if (listener.type === evt.type && listener.handler) {
            fired = true;
            listener.handler(evt);
        }
    });
    return fired;
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
    var baseURL = this.options.baseURL;
    if (!baseURL || /^https?:/.test(url)) {
        return url;
    }
    return removeTrailingSlash(baseURL) + addLeadingSlash(url);
};

/**
 * Resolve a list of URLs
 *
 * @param  {Array<String>} urls
 *
 * @return {Array<String>}
 */
prototype.resolveURLs = function(urls) {
    var _this = this;
    return urls.map(function(url) {
        return _this.resolveURL(url);
    });
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
    var absURL = this.resolveURL(url);
    var props = {
        type: 'object',
        url: absURL,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (!query) {
        query = this.deriveQuery(props);
    }
    if (!query) {
        query = props;
        query.promise = this.get(absURL).then(function(response) {
            var object = response;
            _this.updateQuery(query, {
                object: object,
                retrievalTime: getTime(),
            });
            return object;
        });
        this.addQuery(query);
    }
    return query.promise.then(function(object) {
        if (query.dirty)  {
            _this.refreshOne(query);
        }
        return object;
    });
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
    var absURL = this.resolveURL(url);
    var props = {
        type: 'page',
        url: url,
        page: page,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (!query) {
        var pageURL = attachPageNumber(absURL, page);
        query = props;
        query.promise = this.get(pageURL).then(function(response) {
            var objects = response.results;
            _this.updateQuery(query, {
                objects: objects,
                retrievalTime: getTime(),
            });
            return objects;
        });
        this.addQuery(query)
    }
    return query.promise.then(function(objects) {
        if (query.dirty)  {
            _this.refreshPage(query);
        }
        return objects;
    });
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
    var absURL = this.resolveURL(url);
    var props = {
        type: 'list',
        url: absURL,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (!query) {
        query = props;
        query.promise = this.fetchNextPage(query, true);
        this.addQuery(query);
    }
    return query.promise.then(function(objects) {
        if (query.dirty)  {
            _this.refreshList(query);
        }
        return objects;
    });
};

/**
 * Return what has been fetched. Used by fetchList().
 *
 * @param  {Object} query
 *
 * @return {Promise<Array>}
 */
prototype.fetchNoMore = function(query) {
    return query.promise;
};

/**
 * Initiate fetching of the next page. Used by fetchList().
 *
 * @param  {Object} query
 * @param  {Boolean} initial
 *
 * @return {Promise<Array>}
 */
prototype.fetchNextPage = function(query, initial) {
    if (query.nextPromise) {
        return query.nextPromise;
    }
    var _this = this;
    var nextURL = (initial) ? query.url : query.nextURL;
    var nextPromise = this.get(nextURL).then(function(response) {
        if (response instanceof Array) {
            // the full list is returned
            var objects = response;
            _this.updateQuery(query, {
                objects: objects,
                retrievalTime: getTime(),
                nextPromise: null,
            });
            objects.more = _this.fetchNoMore.bind(_this, query);
            return objects;
        } else if (response instanceof Object) {
            // append retrieved objects to list
            var objects = appendObjects(query.objects, response.results);
            _this.updateQuery(query, {
                objects: objects,
                promise: nextPromise,
                retrievalTime: (initial) ? getTime() : query.retrievalTime,
                nextURL: response.next,
                nextPage: (query.nextPage || 1) + 1,
                nextPromise: null,
            });

            // attach function to results so caller can ask for more results
            if (query.nextURL) {
                objects.more = _this.fetchNextPage.bind(_this, query, false);
            } else {
                objects.more = _this.fetchNoMore.bind(_this, query);
            }

            // inform parent component that more data is available
            if (!initial) {
                _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
            }
            return objects;
        }
    }).catch(function(err) {
        if (!initial) {
            _this.updateQuery(query, { nextPromise: null });
        }
        throw err;
    });
    if (!initial) {
        _this.updateQuery(query, { nextPromise });
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
 * @return {Promise<Array>}
 */
prototype.fetchMultiple = function(urls, options) {
    // see which ones are cached already
    var _this = this;
    var cached = 0;
    var fetchOptions = {};
    for (var name in options) {
        if (name !== 'partial') {
            fetchOptions[name] = options[name];
        }
    }
    var promises = urls.map(function(url) {
        var absURL = _this.resolveURL(url);
        var props = { url: absURL, type: 'object' };
        var query = _this.findQuery(props);
        if (!query) {
            query = _this.deriveQuery(props);
        }
        if (query && query.object) {
            cached++;
            return query.object;
        } else {
            return _this.fetchOne(absURL, fetchOptions);
        }
    });

    // wait for the complete list to arrive
    var completeListPromise;
    if (cached < urls.length) {
        completeListPromise = Promise.all(promises);
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
    if (cached < minimum && completeListPromise) {
        return completeListPromise;
    } else {
        if (completeListPromise) {
            // return partial list then fire change event when complete list arrives
            completeListPromise.then(function(objects) {
                _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
            });
            return promises.map(function(object) {
                if (object.then instanceof Function) {
                    return null;    // a promise--don't return it
                } else {
                    return object;
                }
            });
        } else {
            // list is complete already
            return promises;
        }
    }
};

/**
 * Reperform an query for an object, triggering an onChange event if the
 * object has changed.
 *
 * @param  {Object} query
 */
prototype.refreshOne = function(query) {
    if (query.refreshing) {
        return;
    }
    console.log('Refreshing object', query);
    this.updateQuery(query, { refreshing: true });

    var _this = this;
    var retrievalTime = getTime();
    this.get(query.url).then(function(response) {
        var object = response;
        var changed = true;
        if (matchObject(object, query.object)) {
            object = query.object;
            changed = false;
        }
        _this.updateQuery(query, {
            object: object,
            promise: Promise.resolve(object),
            retrievalTime: retrievalTime,
            refreshing: false,
            dirty: false,
        });
        if (changed) {
            _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
        }
    }).catch(function(err) {
        _this.updateQuery(query, { refreshing: false });
    });
};

/**
 * Reperform an query for a page of objects, triggering an onChange event if
 * the list is different from the one fetched previously.
 *
 * @param  {Object} query
 */
prototype.refreshPage = function(query) {
    if (query.refreshing) {
        return;
    }
    console.log('Refreshing page', query.url);
    this.updateQuery(query, { refreshing: true });

    var _this = this;
    var retrievalTime = getTime();
    var pageURL = attachPageNumber(query.url, query.page);
    this.get(pageURL).then(function(response) {
        var objects = response.results;
        var changed = true;
        if (replaceIdentificalObjects(objects, query.objects)) {
            objects = query.objects;
            changed = false;
        }
        _this.updateQuery(query, {
            objects: objects,
            promise: Promise.resolve(objects),
            retrievalTime: retrievalTime,
            refreshing: false,
            dirty: false,
        })
        if (changed) {
            _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
        }
    }).catch(function(err) {
        _this.updateQuery(query, { refreshing: false });
    });
};

/**
 * Reperform an query for a list of objects, triggering an onChange event if
 * the list is different from the one fetched previously.
 *
 * @param  {Object} query
 */
prototype.refreshList = function(query) {
    if (query.refreshing) {
        return;
    }
    console.log('Refreshing list', query.url);
    this.updateQuery(query, { refreshing: true });

    var _this = this;
    if (query.nextPage) {
        // updating paginated list
        // wait for any call to more() to finish first
        waitForNextPage(query).then(function() {
            // suppress fetching of additional pages for the time being
            var oldObjects = query.objects;
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
            var pageRemaining = query.nextPage - 1;
            var nextURL = query.url;

            var refreshNextPage = function() {
                return _this.get(nextURL).then(function(response) {
                    pageRemaining--;
                    nextURL = response.next;
                    refreshedObjects = appendObjects(refreshedObjects, response.results);
                    var objects = joinObjectLists(refreshedObjects, oldObjects);
                    var changed = true;
                    objects.more = fetchMoreAfterward;
                    if (replaceIdentificalObjects(objects, query.objects)) {
                        objects = query.objects;
                        changed = false;
                    }
                    // set query.nextURL to the URL given by the server
                    // in the event that new pages have become available
                    _this.updateQuery(query, {
                        objects: objects,
                        promise: Promise.resolve(objects),
                        nextURL: (pageRemaining === 0) ? nextURL : query.nextURL,
                    });
                    if (changed) {
                        _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
                    }
                    // keep going until all pages have been updated
                    if (pageRemaining > 0 && nextURL && query.nextURL !== nextURL) {
                        return refreshNextPage();
                    }
                });
            };

            var retrievalTime = getTime();
            refreshNextPage().then(function() {
                // we're done--reenable fetching of additional pages
                if (query.nextURL) {
                    query.objects.more = _this.fetchNextPage.bind(_this, query, false);
                } else {
                    query.objects.more = _this.fetchNoMore.bind(_this, query);
                }
                // trigger it if more() had been called
                if (morePromise) {
                    query.objects.more().then(moreResolve, moreReject);
                }
                _this.updateQuery(query, {
                    retrievalTime: retrievalTime,
                    refreshing: false,
                    dirty: false,
                });
            }).catch(function(err) {
                _this.updateQuery(query, { refreshing: false });
            });
        });
    } else {
        // updating un-paginated list
        var retrievalTime = getTime();
        this.get(query.url).then(function(response) {
            var objects = response;
            var changed = true;
            if (replaceIdentificalObjects(objects, query.objects)) {
                objects = query.objects;
                changed = false;
            }
            objects.more = _this.fetchNoMore.bind(this, query);
            _this.updateQuery(query, {
                objects: objects,
                promise: Promise.resolve(objects),
                retrievalTime: retrievalTime,
                refreshing: false,
                dirty: false,
            });
            if (changed) {
                _this.triggerEvent(new RelaksDjangoDataSourceEvent('change', _this));
            }
        }).catch(function(err) {
            _this.updateQuery(query, { refreshing: false });
            throw err;
        });
    }
};

/**
 * Insert an object into remote database
 *
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.insertOne = function(folderURL, object) {
    return this.insertMultiple(folderURL, [ object ]).then((insertedObjects) => {
        return insertedObjects[0];
    });
};

/**
 * Insert multiple objects into remote database
 *
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
prototype.insertMultiple = function(folderURL, objects) {
    var _this = this;
    var folderAbsURL = this.resolveURL(folderURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        promises.push(this.post(folderAbsURL, objects[i]));
    }
    return Promise.all(promises).then(function(insertedObjects) {
        // sort the newly created objects
        var changed = false;
        var queries = _this.queries.filter(function(query) {
            insertedObjects.some(function(insertedObject) {
                if (query.type === 'object') {
                    // object queries aren't affected by insert
                    // no point in looking at other objects
                    return true;
                } else if (query.type === 'page' || query.type === 'list') {
                    var objectFolderURL = getObjectFolderURL(folderAbsURL, insertedObject);
                    if (!matchURL(query.url, objectFolderURL)) {
                        return false;
                    }
                    // it isn't possible to insert objects into multiple folders
                    // simultaneously; code is implemented as such only for
                    // consistency sake
                    var insertedObjectsInFolder = removeObjectsOutsideFolder(insertedObjects, objectFolderURL);
                    var defaultBehavior = 'refresh';
                    var impact = runHook(query, 'afterInsert', insertedObjectsInFolder, defaultBehavior);
                    if (impact) {
                        if (impact instanceof Array) {
                            var objects = impact;
                            if (query.type === 'list') {
                                objects.more = query.objects.more;
                            }
                            query.objects = objects;
                            query.promise = Promise.resolve(objects);
                        } else {
                            query.dirty = true;
                        }
                        changed = true;
                    }
                    return true;
                }
            });
            return true;
        });
        _this.updateQueriesIfChanged(queries, changed);
        return insertedObjects;
    });
};

/**
 * Update an object
 *
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.updateOne = function(folderURL, object) {
    // allow folderURL to be omitted
    if (object === undefined && folderURL instanceof Object) {
        object = folderURL;
        folderURL = null;
    }
    return this.updateMultiple(folderURL, [ object ]).then((results) => {
        return results[0];
    });
};

/**
 * Save multiple objects
 *
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
prototype.updateMultiple = function(folderURL, objects) {
    // allow folderURL to be omitted
    if (objects === undefined && folderURL instanceof Array) {
        objects = folderURL;
        folderURL = null;
    }
    var _this = this;
    var folderAbsURL = this.resolveURL(folderURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var absURL = getObjectURL(folderAbsURL, object);
        promises.push(absURL ? this.put(absURL, object) : null);
    }
    return Promise.all(promises).then(function(updatedObjects) {
        var changed = false;
        var queries = _this.queries.filter(function(query) {
            updatedObjects.some(function(updatedObject) {
                if (query.type === 'object') {
                    var objectURL = getObjectURL(folderAbsURL, updatedObject);
                    if (!matchURL(query.url, objectURL)) {
                        return false;
                    }
                    var defaultBehavior = 'replace';
                    var impact = runHook(query, 'afterUpdate', updatedObject, defaultBehavior);
                    if (impact) {
                        if (impact instanceof Object) {
                            var object = impact;
                            query.object = object;
                            query.promise = Promise.resolve(object);
                        } else {
                            query.dirty = true;
                        }
                        changed = true;
                    }
                    return true;
                } else if (query.type === 'page' || query.type === 'list') {
                    var objectFolderURL = getObjectFolderURL(folderAbsURL, updatedObject);
                    if (!matchURL(query.url, objectFolderURL)) {
                        return false;
                    }
                    // filter out objects that aren't in the same folder
                    //
                    // only relevant when hyperlink-keys are used and
                    // objects in different folders are updated at
                    // the same time (folderURL has to be null)
                    var updatedObjectsInFolder = removeObjectsOutsideFolder(updatedObjects, objectFolderURL);
                    var defaultBehavior = 'refresh';
                    var impact = runHook(query, 'afterUpdate', updatedObjectsInFolder, defaultBehavior);
                    if (impact) {
                        if (impact instanceof Array) {
                            var objects = impact;
                            if (query.type === 'list') {
                                objects.more = query.objects.more;
                            }
                            query.objects = objects;
                            query.promise = Promise.resolve(objects);
                        } else {
                            query.dirty = true;
                        }
                        changed = true;
                    }
                    return true;
                }
            });
            return true;
        });
        _this.updateQueriesIfChanged(queries, changed);
        return updatedObjects;
    });
};

prototype.deleteOne = function(url, object) {
    return this.deleteMultiple(url, [ object ]).then((results) => {
        return results[0];
    });
};

prototype.deleteMultiple = function(folderURL, objects) {
    // allow folderURL to be omitted
    if (objects === undefined && folderURL instanceof Array) {
        objects = folderURL;
        folderURL = null;
    }
    var _this = this;
    var folderAbsURL = this.resolveURL(folderURL);
    var promises = [];
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var absURL = getObjectURL(folderAbsURL, object);
        var promise = null;
        if (absURL) {
            promise = this.delete(absURL, object).then(function() {
                return object;
            });
        }
        promises.push(promise);
    }
    return Promise.all(promises).then(function(deletedObjects) {
        var changed = false;
        var queries = _this.queries.filter(function(query) {
            var keep = true;
            deletedObjects.some(function(deletedObject) {
                if (query.type === 'object') {
                    var objectURL = getObjectURL(folderAbsURL, deletedObject);
                    if (!matchURL(query.url, objectURL)) {
                        return false;
                    }
                    var defaultBehavior = 'remove';
                    var impact = runHook(query, 'afterDelete', deletedObject, defaultBehavior);
                    if (impact) {
                        if (impact instanceof Object) {
                            var object = impact;
                            query.object = object;
                            query.promise = Promise.resolve(object);
                        } else {
                            keep = false;
                        }
                        changed = true;
                    }
                    return true;
                } else if (query.type === 'page' || query.type === 'list') {
                    var objectFolderURL = getObjectFolderURL(folderAbsURL, deletedObject);
                    if (!matchURL(query.url, objectFolderURL)) {
                        return false;
                    }
                    // see comment in updateMultiple()
                    var deletedObjectsInFolder = removeObjectsOutsideFolder(deletedObjects, objectFolderURL);
                    var defaultBehavior = (query.type === 'list') ? 'remove' : 'refresh';
                    var impact = runHook(query, 'afterDelete', deletedObjectsInFolder, defaultBehavior);
                    if (impact) {
                        if (impact instanceof Array) {
                            var objects = impact;
                            if (query.type === 'list') {
                                objects.more = query.objects.more;
                            }
                            query.objects = objects;
                            query.promise = Promise.resolve(objects);
                        } else {
                            query.dirty = true;
                        }
                        changed = true;
                    }
                    return true;
                }
            });
            return keep;
        });
        _this.updateQueriesIfChanged(queries, changed);
        return deletedObjects;
    });
};

/**
 * Find an existing query
 *
 * @param  {Object} props
 *
 * @return {Object|undefined}
 */
prototype.findQuery = function(props) {
    return this.queries.find(function(query) {
        return matchQuery(query, props);
    });
};

/**
 * Derive a query for an item from an existing directory query
 *
 * @param  {Object} props
 *
 * @return {Object|undefined}
 */
prototype.deriveQuery = function(props) {
    var object;
    var folderURL = getFolderURL(props.url);
    this.queries.some(function(query) {
        if (query.type === 'page' || query.type === 'list') {
            var abbreviated = false;
            if (this.options.abbreviatedFolderContents) {
                abbreviated = true;
            } else if (query.options.abbreviated) {
                abbreviated = true;
            }
            if (!abbreviated) {
                if (matchURL(query.url, folderURL)) {
                    query.objects.some(function(item) {
                        if (item.url === props.url) {
                            object = item;
                        }
                    });
                    return !!object;
                }
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
 * Add a query
 *
 * @param {Object} query
 */
prototype.addQuery = function(query) {
    this.queries = [ query ].concat(this.queries);
};

/**
 * Update a query
 *
 * @param  {Object} query
 * @param  {Object} props
 */
prototype.updateQuery = function(query, props) {
    for (var name in props) {
        query[name] = props[name];
    }
};

/**
 * Update query list if it has changed and trigger change event
 *
 * @param  {Array} queries
 * @param  {Boolean} changed
 */
prototype.updateQueriesIfChanged = function(queries, changed) {
    if (changed) {
        this.queries = queries;
        this.triggerEvent(new RelaksDjangoDataSourceEvent('change', this));
    }
};

/**
 * Return a promise that will be resolved when authentication occurs or
 * attempt is canceled
 *
 * @param  {String} absURL
 *
 * @return {Promise<Boolean>}
 */
prototype.requestAuthentication = function(absURL) {
    var promise;
    this.authentications.some(function(authentication) {
        if (authentication.url === absURL) {
            promise = authentication.promise;
            return true;
        }
    });
    if (!promise) {
        // add the query prior to triggering the event, since the handler
        // may call authorize()
        var resolve;
        var authentication = {
            url: absURL,
            promise: new Promise(function(r) { resolve = r }),
            resolve: resolve,
        };
        this.authentications.push(authentication);

        var authenticationEvent = new RelaksDjangoDataSourceEvent('authentication', this, {
            url: absURL
        });
        var eventHandled = this.triggerEvent(authenticationEvent);
        promise = authenticationEvent.waitForDecision().then(function() {
            if (eventHandled && !authenticationEvent.defaultPrevented) {
                // wait for authenticate() to get called
                // if authorize() was called, the promise would be resolved already
                return authentication.promise;
            } else {
                // take it back out
                var index = this.authentications.indexOf(authentication);
                this.authentications.splice(index, 1);
                return false;
            }
        });
    }
    return promise;
};

/**
 * Post user credentials to given URL in expectant of a authorization token
 *
 * @param  {String} loginURL
 * @param  {Object} credentials
 * @param  {Array<String>} allowURLs
 *
 * @return {Promise<Boolean>}
 */
prototype.authenticate = function(loginURL, credentials, allowURLs) {
    var _this = this;
    var loginAbsURL = this.resolveURL(loginURL);
    return this.post(loginAbsURL, credentials).then(function(response) {
        var token = (response) ? response.key : null;
        if (!token) {
            throw new Error('No authorization token');
        }
        return _this.authorize(loginURL, token, allowURLs);
    });
};

/**
 * Accept an authorization token, resolving any pending authentication promises
 *
 * @param  {String} loginURL
 * @param  {String} token
 * @param  {Array<String>} allowURLs
 *
 * @return {Promise<Boolean>}
 */
prototype.authorize = function(loginURL, token, allowURLs) {
    var _this = this;
    var loginAbsURL = this.resolveURL(loginURL);
    var allowAbsURLs = this.resolveURLs(allowURLs || [ '/' ]);
    var authorizationEvent = new RelaksDjangoDataSourceEvent('authorization', this, {
        url: loginAbsURL,
        token: token,
    });
    this.triggerEvent(authorizationEvent);
    return authorizationEvent.waitForDecision().then(function() {
        var acceptable = !authorizationEvent.defaultPrevented;
        if (acceptable) {
            // add authorization
            var authorization = {
                url: loginAbsURL,
                token: token,
                allow: allowAbsURLs,
                deny: []
            };
            // remove previous authorization
            _this.authorizations = _this.authorizations.filter(function(authorization) {
                authorization.allow = authorization.allow.filter(function(url) {
                    return (allowAbsURLs.indexOf(url) === -1);
                });
                return (authorization.allow.length > 0);
            });
            _this.authorizations.push(authorization);
        }
        // resolve and remove authentication querys
        _this.authentications = _this.authentications.filter(function(authentication) {
            if (matchAnyURL(authentication.url, allowAbsURLs)) {
                authentication.resolve(acceptable);
                return false;
            } else {
                return true;
            }
        });
        return acceptable;
    });
};

prototype.getAuthorizationToken = function(url) {
    var token;
    this.authorizations.some(function(authorization) {
        if (matchAnyURL(url, authorization.allow)) {
            if (!matchAnyURL(url, authorization.deny)) {
                token = authorization.token;
                return true;
            }
        }
    });
    return token;
};

prototype.cancelAuthentication = function(allowURLs) {
    var allowAbsURLs = this.resolveURLs(allowURLs || [ '/' ]);
    this.authentications = this.authentications.filter(function(authentication) {
        if (matchAnyURL(authentication.url, allowAbsURLs)) {
            authentication.resolve(false);
            return false;
        } else {
            return true;
        }
    });
};

prototype.cancelAuthorization = function(denyURLs) {
    var denyAbsURLs = this.resolveURLs(denyURLs || [ '/' ]);
    this.authorizations = this.authorizations.filter(function(authorization) {
        authorization.allow = authorization.allow.filter(function(url) {
            return (denyURLs.indexOf(url) === -1);
        });
        // add to deny list if it's still allowed
        denyAbsURLs.forEach(function(url) {
            if (matchAnyURL(url, authorization.allow)) {
                authorization.deny.push(url);
            }
        });
        return (authorization.allow.length > 0);
    });
};

prototype.revokeAuthorization = function(logoutURL) {
    var logoutAbsURL = this.resolveURLs(logoutURL);
    return fetch(logoutAbsURL, options).then(function(response) {
        if (response.status < 400) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }).then(function(response) {
        this.authorizations = this.authorizations.filter(function(authorization) {
            var folderURL1 = getFolderURL(authorization.url);
            var folderURL2 = getFolderURL(logoutAbsURL);
            return (folderURL1 !== folderURL2);
        });
    });
};

/**
 * Start expiration checking
 */
prototype.startExpirationCheck = function() {
    if (this.options.refreshInterval > 0) {
        if (!this.expirationCheckInterval) {
            var _this = this;
            this.expirationCheckInterval = setInterval(function() {
                _this.checkExpiration();
            }, 5000);
        }
    }
};

/**
 * Stop expiration checking
 */
prototype.stopExpirationCheck = function() {
    if (this.expirationCheckInterval) {
        clearInterval(this.expirationCheckInterval);
        this.expirationCheckInterval = 0;
    }
};

/**
 * Mark queries as dirty and trigger onChange event when enough time has passed
 */
prototype.checkExpiration = function() {
    var interval = Number(this.options.refreshInterval);
    if (!interval) {
        return;
    }
    var limit = getTime(-interval);
    var changed = false;
    var queries = this.queries.filter(function(query) {
        if (!query.dirty) {
            if (query.retrievalTime < limit) {
                query.dirty = true;
                changed = true;
            }
        }
        return true;
    });
    if (changed) {
        this.queries = queries;
        this.triggerEvent(new RelaksDjangoDataSourceEvent('change', this));
    }
};

/**
 * Fetch JSON object at URL
 *
 * @param  {String} url
 *
 * @return {Promise<Object>}
 */
prototype.get = function(url) {
    var options = {
        method: 'GET',
        headers: {},
    };
    return this.request(url, options);
};

prototype.post = function(url, object) {
    var options = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    };
    return this.request(url, options);
};

prototype.put = function(url, object) {
    var options = {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    };
    return this.request(url, options);
};

prototype.delete = function(url, object) {
    var options = {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        headers: {},
    };
    return this.request(url, options);
};

prototype.request = function(url, options) {
    var _this = this;
    var token = this.getAuthorizationToken(url);
    if (token) {
        var keyword = this.options.authorizationKeyword;
        options.headers['Authorization'] = keyword + ' ' + token;
    }
    return fetch(url, options).then(function(response) {
        if (response.status < 400) {
            if (response.status == 204) {
                return '';
            }
            return response.json();
        } else if (response.status === 401) {
            return _this.requestAuthentication(url).then(function(authenticated) {
                if (authenticated) {
                    delete options.headers['Authorization'];
                    return _this.request(url, options);
                } else {
                    throw new Error(response.statusText);
                }
            });
        } else {
            throw new Error(response.statusText);
        }
    });
};

/**
 * Run hook function on an cached fetch query after an insert, update, or
 * delete operation.
 *
 * @param  {Object} query
 * @param  {String} hookName
 * @param  {Array<Object>|Object} input
 * @param  {String} defaultBehavior
 *
 * @return {Boolean|Array<Object>|Object}
 */
function runHook(query, hookName, input, defaultBehavior) {
    var hookFunc = (query.options) ? query.options[hookName] : null;
    if (!hookFunc) {
        hookFunc = defaultBehavior;
    }
    if (typeof(hookFunc) === 'string') {
        switch (hookFunc) {
            case 'refresh':
                hookFunc = refreshQuery;
                break;
            case 'ignore':
                hookFunc = ignoreChange;
                break;
            default:
                switch (query.type + '::' + hookFunc) {
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
                    case 'list::remove':
                    case 'page::remove':
                        hookFunc = removeObjects;
                        break;
                    default:
                        throw new Error('Unknown hook name: ' + hookFunc)
                }
        }
    }
    if (query.type === 'object') {
        if (query.object) {
            return hookFunc(query.object, input);
        } else {
            // need to run query again, in case the data currently in flight
            // is already stale
            return true;
        }
    } else if (query.type === 'page' || query.type === 'list') {
        if (query.objects) {
            // get rid of null and sort list by ID or URL
            input = input.filter(Boolean);
            sortObjects(input);
            return hookFunc(query.objects, input);
        } else {
            return true;
        }
    }
}

/**
 * Return false to indicate that change should be ignored
 *
 * @return {Boolean}
 */
function ignoreChange() {
    return false;
}

/**
 * Return true to indicate that query should be rerun
 *
 * @return {Boolean}
 */
function refreshQuery() {
    return true;
}

/**
 * Return the new object
 *
 * @param  {Object} object
 * @param  {Object} newObject
 *
 * @return {Object|false}
 */
function replaceObject(object, newObject) {
    if (!matchObject(newObject, object)) {
        return newObject;
    }
    return false;
}

/**
 * Replace old version of objects with new ones
 *
 * @param  {Array<Object>]} objects
 * @param  {Array<Object>} newObjects
 *
 * @return {Array<Object>|false}
 */
function replaceObjects(objects, newObjects) {
    var changed = false;
    var newList = objects.map(function(object) {
        var newObject = findObject(newObjects, object);
        if (newObject) {
            if (!matchObject(newObject, object)) {
                changed = true;
                return newObject;
            }
        }
        return object;
    });
    return (changed) ? newList : false;
}

/**
 * Add new objects at beginning of list
 *
 * @param  {Array<Object>} objects
 * @param  {Array<Object>} newObjects
 *
 * @return {Array<Object>|false}
 */
function unshiftObjects(objects, newObjects) {
    var changed = false;
    var newList = objects.slice();
    newObjects.forEach(function(object) {
        var index = findObjectIndex(newList, object);
        if (index === -1) {
            newList.unshift(object);
            changed = true;
        } else if (!matchObject(newList[index], object)) {
            newList[index] = object;
            changed = true;
        }
    });
    return (changed) ? newList : false;
}

/**
 * Add new objects at end of list
 *
 * @param  {Array<Object>} objects
 * @param  {Array<Object>} newObjects
 *
 * @return {Array<Object>|false}
 */
function pushObjects(objects, newObjects) {
    var changed = false;
    var newList = objects.slice();
    newObjects.forEach(function(object) {
        var index = findObjectIndex(newList, object);
        if (index === -1) {
            newList.push(object);
            changed = true;
        } else if (!matchObject(newList[index], object)) {
            newList[index] = object;
            changed = true;
        }
    });
    return (changed) ? newList : false;
}

/**
 * Remove objects from list
 *
 * @param  {Array<Object>} objects
 * @param  {Array<Object>} deletedObjects
 *
 * @return {Array<Object>|false}
 */
function removeObjects(objects, deletedObjects) {
    var changed = false;
    var newList = objects.filter(function(object) {
        if (findObjectIndex(deletedObjects, object) !== -1) {
            changed = true;
            return false;
        } else {
            return true;
        }
    });
    return (changed) ? newList : false;
}

/**
 * See if a query has the given properties
 *
 * @param  {Object} query
 * @param  {Object} props
 *
 * @return {Boolean}
 */
function matchQuery(query, props) {
    for (var name in props) {
        if (!matchObject(query[name], props[name])) {
            return false;
        }
    }
    return true;
}

/**
 * See if two objects are identical
 *
 * @param  {*} object1
 * @param  {*} object2
 *
 * @return {Boolean}
 */
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

/**
 * Check if the given URL match any in the list
 *
 * @param  {String} url
 * @param  {Array<String>} otherURLs
 *
 * @return {Boolean}
 */
function matchAnyURL(url, otherURLs) {
    return otherURLs.some(function(otherURL) {
        if (otherURL === url) {
            return true;
        } else if (url.substr(0, otherURL.length) === otherURL) {
            var lc = otherURL.charAt(otherURL.length - 1);
            var ec = url.charAt(otherURL.length);
            if (lc === '/' || ec === '/') {
                return true;
            }
        }
    });
}

/**
 * Remove trailing slash from URL
 *
 * @param  {String} url
 *
 * @return {String}
 */
function removeTrailingSlash(url) {
    var lc = url.charAt(url.length - 1);
    if (lc === '/') {
        return url.substr(0, url.length - 1);
    }
    return url;
}

/**
 * Add leading slash to URL
 *
 * @param  {String} url
 *
 * @return {String}
 */
function addLeadingSlash(url) {
    var fc = url.charAt(0);
    if (fc !== '/') {
        return '/' + url;
    }
    return url;
}

/**
 * Return the URL of the parent folder
 *
 * @param  {String} url
 *
 * @return {String}
 */
function getFolderURL(url) {
    var ei = url.lastIndexOf('/');
    if (ei === url.length - 1) {
        ei = url.lastIndexOf('/', ei - 1);
    }
    if (ei !== -1) {
        return url.substr(0, ei + 1);
    }
}

function getObjectURL(folderURL, object) {
    if (!object) {
        return;
    }
    if (folderURL && object.id) {
        return removeTrailingSlash(folderURL) + '/' + object.id + '/';
    } else if (object.url) {
        return object.url;
    }
}

function getObjectFolderURL(folderURL, object) {
    if (!object) {
        return;
    }
    if (folderURL && object.id) {
        return folderURL;
    } else if (object.url) {
        return getFolderURL(object.url);
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

function waitForNextPage(query) {
    return query.nextPromise || Promise.resolve();
}

function matchURL(url1, url2) {
    var qi = url1.lastIndexOf('?');
    if (qi !== -1) {
        url1 = url1.substr(0, qi);
    }
    return (url1 === url2);
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

/**
 * Filter out objects that aren't in the directory. Will always return the
 * same list when objects are keyed by ID and not URL
 *
 * @param  {Array<Object>} objects
 * @param  {String} folderURL
 *
 * @return {Array<Object>}
 */
function removeObjectsOutsideFolder(objects, folderURL) {
    return objects.filter(function(object) {
        var otherfolderURL = getObjectFolderURL(folderURL, object);
        if (otherfolderURL === folderURL) {
            return true;
        }
    });
}

function getTime(diff) {
    var date = new Date;
    if (diff) {
        date = new Date(date.getTime() + diff);
    }
    return date.toISOString();
}

function RelaksDjangoDataSourceEvent(type, target, props) {
    this.type = type;
    this.target = target;
    for (var name in props) {
        this[name] = props[name];
    }
    this.defaultPrevented = false;
    this.decisionPromise = null;
}

var prototype = RelaksDjangoDataSourceEvent.prototype;

prototype.preventDefault = function() {
    this.defaultPrevented = true;
};

prototype.postponeDefault = function(promise) {
    if (!promise || !(promise.then instanceof Function)) {
        this.decisionPromise = promise;
    }
};

prototype.waitForDecision = function() {
    return this.decisionPromise || Promise.resolve();
};

module.exports = RelaksDjangoDataSource;
module.exports.RelaksDjangoDataSource = RelaksDjangoDataSource;
module.exports.RelaksDjangoDataSourceEvent = RelaksDjangoDataSourceEvent;
