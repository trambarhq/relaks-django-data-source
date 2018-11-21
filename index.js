var EventEmitter = require('relaks-event-emitter');
var GenericEvent = EventEmitter.GenericEvent;

var defaultOptions = {
    baseURL: '',
    refreshInterval: 0,
    authorizationKeyword: 'Token',
    abbreviatedFolderContents: false,
};

function RelaksDjangoDataSource(options) {
    EventEmitter.call(this);
    this.active = false;
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

var prototype = RelaksDjangoDataSource.prototype = Object.create(EventEmitter.prototype)

/**
 * Activate the component
 */
prototype.activate = function() {
    if (!this.active) {
        this.startExpirationCheck();
        this.active = true;
    }
};

/**
 * Activate the component
 */
prototype.deactivate = function() {
    if (this.active) {
        this.stopExpirationCheck();
        this.active = false;
    }
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
    if (baseURL && !/^https?:/.test(url)) {
        if (!/^https?:/.test(baseURL)) {
            if (typeof(location) === 'object') {
                baseURL = location.protocol + '//' + location.host + baseURL;
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('Base URL is not absolute');
                }
            }
        }
        url = removeTrailingSlash(baseURL) + addLeadingSlash(url);
    }
    url = addTrailingSlash(url);
    return url;
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
 * Trigger a 'change' event unless changed is false
 *
 * @param  {Boolean} changed
 *
 * @return {Boolean}
 */
prototype.notifyChanges = function(changed) {
    if (changed === false) {
        return false;
    }
    this.triggerEvent(new RelaksDjangoDataSourceEvent('change', this));
    return true;
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
        query = this.deriveQuery(absURL, true);
    }
    if (!query) {
        var time = getTime();
        query = props;
        query.promise = this.get(absURL).then(function(response) {
            var object = response;
            query.object = object;
            query.time = time;
            _this.processFreshObject(object, absURL, query, true);
            return object;
        });
        this.queries.unshift(query);
    }
    return query.promise.then(function(object) {
        if (query.expired)  {
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
        url: absURL,
        page: page,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (!query) {
        var pageURL = attachPageNumber(absURL, page);
        var time = getTime();
        query = props;
        query.promise = this.get(pageURL).then(function(response) {
            var objects, total;
            if (response instanceof Array) {
                objects = response;
                total = objects.length;
            } else {
                objects = response.results;
                total = response.count;
            }
            objects.total = total;
            query.objects = objects;
            query.time = time;
            _this.processFreshObjects(objects, pageURL, query, true);
            return objects;
        });
        this.queries.push(query);
    }
    return query.promise.then(function(objects) {
        if (query.expired)  {
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
        this.queries.push(query);
    }
    return query.promise.then(function(objects) {
        if (query.expired)  {
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
    var time = getTime();
    var nextURL = (initial) ? query.url : query.nextURL;
    var nextPromise = this.get(nextURL).then(function(response) {
        if (response instanceof Array) {
            // the full list is returned
            var objects = response;
            objects.more = _this.fetchNoMore.bind(_this, query);
            objects.total = objects.length;
            query.objects = objects;
            query.time = time;
            query.nextPromise = null;
            _this.processFreshObjects(objects, nextURL, query, true);
            return objects;
        } else if (response instanceof Object) {
            // append retrieved objects to list
            var total = response.count;
            var freshObjects = response.results;
            var objects = appendObjects(query.objects, freshObjects);
            query.objects = objects;
            query.promise = nextPromise;
            query.nextPromise = null;
            query.nextURL = response.next;
            query.nextPage = (query.nextPage || 1) + 1;
            if (initial) {
                query.time = time;
            }
            _this.processFreshObjects(freshObjects, nextURL, query, initial);

            // attach function to results so caller can ask for more results
            if (query.nextURL) {
                objects.more = _this.fetchNextPage.bind(_this, query, false);
                objects.total = total;

                // if minimum is provide, fetch more if it's not met
                var minimum = getMinimum(query.options, total, NaN);
                if (objects.length < minimum) {
                    // fetch the next page
                    return _this.fetchNextPage(query, false);
                }
            } else {
                objects.more = _this.fetchNoMore.bind(_this, query);
                objects.total = objects.length;
            }

            // inform parent component that more data is available
            _this.notifyChanges(!initial);
            return objects;
        }
    }).catch(function(err) {
        if (!initial) {
            query.nextPromise = null;
        }
        throw err;
    });
    if (!initial) {
        query.nextPromise = nextPromise;
    }
    return nextPromise;
};

/**
 * Fetch multiple JSON objects. If minimum is specified, then immediately
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
        if (name !== 'minimum') {
            fetchOptions[name] = options[name];
        }
    }
    var cachedResults = [];
    var promises = urls.map(function(url) {
        var absURL = _this.resolveURL(url);
        var props = {
            url: absURL,
            type: 'object',
            options: fetchOptions
        };
        var query = _this.findQuery(props);
        if (!query) {
            query = _this.deriveQuery(absURL, true);
        }
        if (query && query.object) {
            cached++;
            cachedResults.push(query.object);
            return query.object;
        } else {
            cachedResults.push(null);
            return _this.fetchOne(absURL, fetchOptions);
        }
    });

    // wait for the complete list to arrive
    var completeListPromise;
    if (cached < urls.length) {
        completeListPromise = this.waitForResults(promises).then(function(outcome) {
            if (outcome.error) {
                throw outcome.error;
            }
            return outcome.results;
        });
    }

    // see whether partial result set should be immediately returned
    var minimum = getMinimum(options, urls.length, urls.length);
    if (cached < minimum && completeListPromise) {
        return completeListPromise;
    } else {
        if (completeListPromise) {
            // return partial list then fire change event when complete list arrives
            completeListPromise.then(function(objects) {
                _this.notifyChanges();
            });
        }
        return Promise.resolve(cachedResults);
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
    query.refreshing = true;

    var _this = this;
    var time = getTime();
    this.get(query.url).then(function(response) {
        var object = response;
        query.time = time;
        query.refreshing = false;
        query.expired = false;
        if (!matchObject(object, query.object)) {
            query.object = object;
            query.promise = Promise.resolve(object);
            _this.processFreshObject(object, query.url, query, false);
            _this.notifyChanges();
        }
    }).catch(function(err) {
        query.refreshing = false;
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
    query.refreshing = true;

    var _this = this;
    var time = getTime();
    var pageURL = attachPageNumber(query.url, query.page);
    this.get(pageURL).then(function(response) {
        var objects, total;
        if (response instanceof Array) {
            objects = response;
            total = response.length;
        } else {
            objects = response.results
            total = response.count;
        }

        // remove other pages (unless they're refreshing)
        var otherQueries = [];
        _this.queries = _this.queries.filter(function(otherQuery) {
            if (otherQuery.url === query.url) {
                if (otherQuery.page !== query.page) {
                    if (otherQuery.expired && !otherQuery.refreshing) {
                        otherQueries.push(otherQuery);
                        return false;
                    }
                }
            }
            return true;
        });
        setTimeout(function() {
            otherQueries.forEach(function(otherQuery) {
                _this.fetchPage(otherQuery.url, otherQuery.page, otherQuery.options);
            });
        }, 1000);

        query.time = time;
        query.refreshing = false;
        query.expired = false;
        var freshObjects = replaceIdentificalObjects(objects, query.objects);
        if (freshObjects) {
            objects.total = total;
            query.objects = objects;
            query.promise = Promise.resolve(objects);
            _this.processFreshObjects(freshObjects, pageURL, query, false);
            _this.notifyChanges();
        }
    }).catch(function(err) {
        query.refreshing = false;
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
    query.refreshing = true;

    var _this = this;
    if (query.nextPage) {
        // updating paginated list
        // wait for any call to more() to finish first
        (query.nextPromise || Promise.resolve()).then(function() {
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
                    if (pageRemaining === 0) {
                        // set query.nextURL to the URL given by the server
                        // in the event that new pages have become available
                        query.nextURL = nextURL;
                    }
                    refreshedObjects = appendObjects(refreshedObjects, response.results);

                    var total = response.count;
                    var objects = joinObjectLists(refreshedObjects, oldObjects);
                    var freshObjects = replaceIdentificalObjects(objects, query.objects);
                    if (freshObjects) {
                        objects.total = total;
                        objects.more = fetchMoreAfterward;
                        query.objects = objects;
                        query.promise = Promise.resolve(objects);
                        _this.processFreshObjects(freshObjects, query.url, query, false);
                        _this.notifyChanges();
                    }

                    // keep going until all pages have been updated
                    if (query.nextURL !== nextURL) {
                        return refreshNextPage();
                    }
                });
            };

            var time = getTime();
            refreshNextPage().then(function() {
                // we're done
                query.time = time;
                query.refreshing = false;
                query.expired = false;

                // reenable fetching of additional pages
                if (query.nextURL) {
                    query.objects.more = _this.fetchNextPage.bind(_this, query, false);
                } else {
                    query.objects.more = _this.fetchNoMore.bind(_this, query);
                }

                // trigger it if more() had been called
                if (morePromise) {
                    query.objects.more().then(moreResolve, moreReject);
                }
            }).catch(function(err) {
                query.refreshing = false;
            });
        });
    } else {
        // updating un-paginated list
        var time = getTime();
        this.get(query.url).then(function(response) {
            var objects = response;
            query.time = time;
            query.refreshing = false;
            query.expired = false;
            var freshObjects = replaceIdentificalObjects(objects, query.objects);
            if (freshObjects) {
                objects.more = _this.fetchNoMore.bind(this, query);
                objects.total = objects.length;
                query.objects = objects;
                query.promise = Promise.resolve(objects);
                _this.processFreshObjects(freshObjects, query.url, query, false);
                _this.notifyChanges();
            }
        }).catch(function(err) {
            query.refreshing = false;
            throw err;
        });
    }
};

prototype.processFreshObject = function(object, objectURL, excludeQuery, notify) {
    var op = {
        url: getFolderURL(objectURL),
        results: [ object ],
        rejects: [],
        query: excludeQuery,
    };
    var changed = this.runUpdateHooks(op);
    if (notify)  {
        this.notifyChanges(changed);
    }
    return changed;
};

prototype.processFreshObjects = function(objects, folderURL, excludeQuery, notify) {
    var op = {
        url: omitSearchString(folderURL),
        results: objects,
        rejects: [],
        query: excludeQuery,
    };
    var changed = this.runUpdateHooks(op);
    if (notify)  {
        this.notifyChanges(changed);
    }
    return changed;
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
    return this.insertMultiple(folderURL, [ object ]).then(function(insertedObjects) {
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
    var promises = objects.map(function(object) {
        return _this.post(folderAbsURL, object);
    });
    return this.waitForResults(promises).then(function(outcome) {
        var changed = false;
        segregateResults(folderAbsURL, objects, outcome).forEach((op) => {
            if (_this.runInsertHooks(op)) {
                changed = true;
            }
        });
        if (changed) {
            _this.notifyChanges();
        }
        if (outcome.error) {
            throw outcome.error;
        }
        return outcome.results;
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
    return this.updateMultiple(folderURL, [ object ]).then(function(results) {
        return results[0];
    });
};

/**
 * Update multiple objects
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
    var promises = objects.map(function(object) {
        var absURL = getObjectURL(folderAbsURL, object);
        return _this.put(absURL, object);
    });
    return this.waitForResults(promises).then(function(outcome) {
        var changed = false;
        segregateResults(folderAbsURL, objects, outcome).forEach((op) => {
            if (_this.runUpdateHooks(op)) {
                changed = true;
            }
        });
        _this.notifyChanges(changed);
        if (outcome.error) {
            throw outcome.error;
        }
        return outcome.results;
    });
};

/**
 * Delete an object
 *
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.deleteOne = function(folderURL, object) {
    // allow folderURL to be omitted
    if (object === undefined && folderURL instanceof Object) {
        object = folderURL;
        folderURL = null;
    }
    return this.deleteMultiple(folderURL, [ object ]).then(function(results) {
        return results[0];
    });
};

/**
 * Delete multiple objects
 *
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
prototype.deleteMultiple = function(folderURL, objects) {
    // allow folderURL to be omitted
    if (objects === undefined && folderURL instanceof Array) {
        objects = folderURL;
        folderURL = null;
    }
    var _this = this;
    var folderAbsURL = this.resolveURL(folderURL);
    var promises = objects.map(function(object) {
        var absURL = getObjectURL(folderAbsURL, object);
        return _this.delete(absURL, object).then(function() {
            // create copy of object, as a DELETE op does not return anything
            return cloneObject(object);
        });
    });
    return this.waitForResults(promises).then(function(outcome) {
        var changed = false;
        segregateResults(folderAbsURL, objects, outcome).forEach((op) => {
            if (_this.runDeleteHooks(op)) {
                changed = true;
            }
        });
        _this.notifyChanges(changed);
        if (outcome.error) {
            throw outcome.error;
        }
        return outcome.results;
    });
};

/**
 * Run insert hooks
 *
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runInsertHooks = function(op) {
    var _this = this;
    var changed = false;
    this.queries.forEach(function(query) {
        if (query !== op.query) {
            if (_this.runInsertHook(query, op)) {
                changed = true;
            }
        }
    });

    if (op.results) {
        var time = getTime();
        op.results.forEach(function(newObject) {
            var absURL = getObjectURL(op.url, newObject);
            var query = {
                type: 'object',
                url: absURL,
                promise: Promise.resolve(newObject),
                object: newObject,
                time: time,
            };
            _this.queries.unshift(query);
        });
    }
    return changed;
};

/**
 * Run a query's insert hook if its URL matches
 *
 * @param  {Object} query
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runInsertHook = function(query, op) {
    if (query.type === 'page' || query.type === 'list') {
        var defaultBehavior = 'refresh';
        var queryFolderURL = omitSearchString(query.url);
        if (queryFolderURL === op.url) {
            if (op.rejects) {
                query.expired = true;
                return true;
            }
            if (op.results) {
                var newObjects = excludeObjects(op.results, query.objects);
                if (newObjects) {
                    return runHook(query, 'afterInsert', newObjects, defaultBehavior);
                }
            }
        }
    }
    return false;
};

/**
 * Run afterUpdate hooks
 *
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runUpdateHooks = function(op) {
    var _this = this;
    var changed = false;
    this.queries.forEach(function(query) {
        if (query !== op.query) {
            if (_this.runUpdateHook(query, op)) {
                changed = true;
            }
        }
    });
    return changed;
};

/**
 * Run a query's afterUpdate hook if its URL matches
 *
 * @param  {Object} query
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runUpdateHook = function(query, op) {
    if (query.type === 'object') {
        var defaultBehavior = 'replace';
        var queryFolderURL = getFolderURL(query.url);
        if (queryFolderURL === op.url) {
            if (op.rejects) {
                var rejectedObject = findObject(op.rejects, query.object);
                if (rejectedObject) {
                    query.expired = true;
                    return true;
                }
            }
            if (op.results) {
                var modifiedObject = findObject(op.results, query.object, true);
                if (modifiedObject) {
                    return runHook(query, 'afterUpdate', modifiedObject, defaultBehavior);
                }
            }
        }
    } else if (query.type === 'page' || query.type === 'list') {
        var defaultBehavior = 'refresh';
        var queryFolderURL = omitSearchString(query.url);
        if (queryFolderURL === op.url) {
            if (op.rejects) {
                var rejectedObjects = findObjects(op.rejects, query.objects);
                if (rejectedObjects) {
                    query.expired = true;
                    return true;
                }
            }
            if (op.results) {
                var modifiedObjects = findObjects(op.results, query.objects, true);
                if (modifiedObjects) {
                    return runHook(query, 'afterUpdate', modifiedObjects, defaultBehavior);
                }
            }
        }
    }
    return false;
};

/**
 * Run afterDelete hooks
 *
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runDeleteHooks = function(op) {
    var _this = this;
    var changed = false;
    this.queries = this.queries.filter(function(query) {
        if (query !== op.query) {
            if (_this.runDeleteHook(query, op)) {
                changed = true;
                if (query.expired && query.type === 'object') {
                    return false;
                }
            }
        }
        return true;
    });
    return changed;
};

/**
 * Run a query's afterDelete hook if its URL matches
 *
 * @param  {Object} query
 * @param  {Object} op
 *
 * @return {Boolean}
 */
prototype.runDeleteHook = function(query, op) {
    if (query.type === 'object') {
        var defaultBehavior = 'remove';
        var queryFolderURL = getFolderURL(query.url);
        if (queryFolderURL === op.url) {
            if (op.rejects) {
                var rejectedObject = findObject(op.rejects, query.object);
                if (rejectedObject) {
                    query.expired = true;
                    return true;
                }
            }
            if (op.results) {
                var deletedObject = findObject(op.results, query.object);
                if (deletedObject) {
                    return runHook(query, 'afterDelete', deletedObject, defaultBehavior);
                }
            }
        }
    } else if (query.type === 'page' || query.type === 'list') {
        var defaultBehavior = (query.type === 'list') ? 'remove' : 'refresh';
        var queryFolderURL = omitSearchString(query.url);
        if (queryFolderURL === op.url) {
            if (op.rejects) {
                var rejectedObjects = findObjects(op.rejects, query.objects);
                if (rejectedObjects) {
                    query.expired = true;
                    return true;
                }
            }
            if (op.results) {
                var deletedObjects = findObjects(op.results, query.objects);
                if (deletedObjects) {
                    return runHook(query, 'afterDelete', deletedObjects, defaultBehavior);
                }
            }
        }
    }
    return false;
};

/**
 * Mark matching queries as expired
 *
 * @param  {String|Date} time
 *
 * @return {Boolean}
 */
prototype.invalidate = function(time) {
    if (time instanceof Date) {
        time = time.toISOString();
    }
    var changed = false;
    this.queries.forEach(function(query) {
        if (query.expired) {
            return;
        }
        if (!time || query.time <= time) {
            query.expired = true;
            changed = true;
        }
    });
    return this.notifyChanges(changed);
};

/**
 * Invalidate an object query
 *
 * @param  {String} url
 * @param  {Object|undefined} options
 *
 * @return {Boolean}
 */
prototype.invalidateOne = function(url, options) {
    var changed = false;
    var absURL = this.resolveURL(url);
    var props = {
        type: 'object',
        url: absURL,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (!query) {
        query = this.deriveQuery(absURL, true);
    }
    if (query && !query.expired) {
        query.expired = true;
        changed = true;
    }
    return this.notifyChanges(changed);
};

/**
 * Invalidate a list query
 *
 * @param  {String} url
 * @param  {Object|undefined} options
 *
 * @return {Boolean}
 */
prototype.invalidateList = function(url, options) {
    var changed = false;
    var absURL = this.resolveURL(url);
    var props = {
        type: 'list',
        url: absURL,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (query && !query.expired) {
        query.expired = true;
        changed = true;
    }
    return this.notifyChanges(changed);
};

/**
 * Invalidate a page query
 *
 * @param  {String} url
 * @param  {Number} page
 * @param  {Object|undefined} options
 *
 * @return {Boolean}
 */
prototype.invalidatePage = function(url, page, options) {
    var changed = false;
    var absURL = this.resolveURL(url);
    var props = {
        type: 'page',
        url: absURL,
        page: page,
        options: options || {},
    };
    var query = this.findQuery(props);
    if (query && !query.expired) {
        query.expired = true;
        changed = true;
    }
    return this.notifyChanges(changed);
};

/**
 * Invalidate multiple object queries
 *
 * @param  {Array<String>} urls
 * @param  {Object|undefined} options
 *
 * @return {Boolean}
 */
prototype.invalidateMultiple = function(urls, options) {
    var _this = this;
    var changed = false;
    var fetchOptions = {};
    for (var name in options) {
        if (name !== 'minimum') {
            fetchOptions[name] = options[name];
        }
    }
    urls.forEach(function(url) {
        var absURL = _this.resolveURL(url);
        var props = {
            type: 'object',
            url: absURL,
            options: fetchOptions,
        };
        var query = _this.findQuery(props);
        if (query && !query.expired) {
            query.expired = true;
            changed = true;
        }
    });
    return this.notifyChanges(changed);
};

/**
 * Return true if a URL is cached, with optional check for expiration
 *
 * @param  {String} url
 * @param  {Boolean|undefined} unexpired
 *
 * @return {Boolean}
 */
prototype.isCached = function(url, unexpired) {
    var absURL = this.resolveURL(url);
    var cached = this.queries.some(function(query) {
        if (query.url === absURL) {
            if (query.object || query.objects) {
                return (!unexpired || !query.expired);
            }
        }
    });
    if (!cached) {
        var folderURL = getFolderURL(absURL);
        if (folderURL) {
            var objectID = parseInt(absURL.substr(folderURL.length));
            if (objectID) {
                var query = this.deriveQuery(absURL);
                cached = !!query;
            }
        }
    }
    return cached;
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
 * @param  {String} absURL
 * @param  {Boolean|undefined} add
 *
 * @return {Object|undefined}
 */
prototype.deriveQuery = function(absURL, add) {
    var _this = this;
    var object;
    var time;
    var folderAbsURL = getFolderURL(absURL);
    var objectID = parseInt(absURL.substr(folderAbsURL.length));
    this.queries.some(function(query) {
        if (query.expired) {
            return;
        }
        if (query.type === 'page' || query.type === 'list') {
            var abbreviated = false;
            if (_this.options.abbreviatedFolderContents) {
                abbreviated = true;
            } else if (query.options.abbreviated) {
                abbreviated = true;
            }
            if (!abbreviated) {
                if (omitSearchString(query.url) ===  folderAbsURL) {
                    return query.objects.some(function(item) {
                        if (item.url === absURL || item.id === objectID) {
                            object = item;
                            time = query.time;
                            return true;
                        }
                    });
                }
            }
        }
    });
    if (object) {
        var query = {
            type: 'object',
            url: absURL,
            promise: Promise.resolve(object),
            object: object,
            time: time,
            options: {}
        };
        if (add) {
            this.queries.unshift(query);
        }
        return query;
    }
};

/**
 * Return true when there's an authorization token
 *
 * @param  {String|undefined} url
 *
 * @return {Boolean}
 */
prototype.isAuthorized = function(url) {
    var absURL = this.resolveURL(url || '/');
    var token = this.getToken(absURL);
    return !!token;
};

/**
 * Return a promise that will be fulfilled with the authorization token
 * when authentication suceeds or null if the request was declined
 *
 * @param  {String} absURL
 *
 * @return {Promise<String>}
 */
prototype.requestAuthentication = function(absURL) {
    var _this = this;
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
        this.triggerEvent(authenticationEvent);
        promise = authenticationEvent.waitForDecision().then(function() {
            var waitForAuthentication = !authenticationEvent.defaultPrevented;
            if (waitForAuthentication) {
                // wait for authenticate() to get called
                // if authorize() was called, the promise would be resolved already
                return authentication.promise;
            } else {
                // take it back out
                var index = _this.authentications.indexOf(authentication);
                _this.authentications.splice(index, 1);
                return null;
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
 * @param  {Array<String>|undefined} allowURLs
 *
 * @return {Promise<Boolean>}
 */
prototype.authenticate = function(loginURL, credentials, allowURLs) {
    var _this = this;
    var loginAbsURL = this.resolveURL(loginURL);
    var allowAbsURLs = this.resolveURLs(allowURLs || [ '/' ]);
    var options = this.includeToken(allowAbsURLs[0], {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(credentials),
    });
    return this.request(loginAbsURL, options, false).then(function(response) {
        var token = (response) ? response.key : null;
        if (!token) {
            throw new RelaksDjangoDataSourceError(403, 'No authorization token');
        }
        return _this.authorize(token, allowAbsURLs, true);
    });
};

/**
 * Accept an authorization token, resolving any pending authentication promises
 *
 * @param  {String} token
 * @param  {Array<String>} allowURLs
 * @param  {Boolean} fresh
 *
 * @return {Promise<Boolean>}
 */
prototype.authorize = function(token, allowURLs, fresh) {
    var _this = this;
    var allowAbsURLs = this.resolveURLs(allowURLs || [ '/' ]);
    var authorizationEvent = new RelaksDjangoDataSourceEvent('authorization', this, {
        token: token,
        allowURLs: allowAbsURLs,
        fresh: !!fresh,
    });
    this.triggerEvent(authorizationEvent);
    return authorizationEvent.waitForDecision().then(function() {
        var acceptable = !authorizationEvent.defaultPrevented;
        if (acceptable) {
            // add authorization
            var authorization = {
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

            // resolve and remove authentication querys
            _this.authentications = _this.authentications.filter(function(authentication) {
                if (matchAnyURL(authentication.url, allowAbsURLs)) {
                    authentication.resolve(token);
                    return false;
                } else {
                    return true;
                }
            });
        }
        return acceptable;
    });
};

/**
 * Cancel authentication, causing outstanding operations that require it to
 * fail (i.e. their promises will be rejected).
 *
 * @param  {Array<String>|undefined} allowURLs
 */
prototype.cancelAuthentication = function(allowURLs) {
    var allowAbsURLs = this.resolveURLs(allowURLs || [ '/' ]);
    this.authentications = this.authentications.filter(function(authentication) {
        if (matchAnyURL(authentication.url, allowAbsURLs)) {
            authentication.resolve(null);
            return false;
        } else {
            return true;
        }
    });
};

/**
 * Remove authorization for certain URLs or all URLs.
 *
 * @param  {Array<String>|undefined} denyURLs
 */
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

/**
 * Log out from the remote server
 *
 * @param  {String} logoutURL
 * @param  {Array<String>|undefined} denyURLs
 *
 * @return {Promise}
 */
prototype.revokeAuthorization = function(logoutURL, denyURLs) {
    var _this = this;
    var logoutAbsURL = this.resolveURL(logoutURL);
    var denyAbsURLs = this.resolveURLs(denyURLs || [ '/' ]);
    var options = this.includeToken(denyAbsURLs[0], {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
    });
    return this.request(logoutAbsURL, options, false).then(function() {
        _this.cancelAuthorization(denyAbsURLs);
        var deauthorizationEvent = new RelaksDjangoDataSourceEvent('deauthorization', this, {
            denyURLs: denyAbsURLs,
        });
        _this.triggerEvent(deauthorizationEvent);
        return deauthorizationEvent.waitForDecision().then(() => {
            var clearCachedQueries = !deauthorizationEvent.defaultPrevented;
            if (clearCachedQueries) {
                var changed = false;
                _this.queries = _this.queries.filter(function(query) {
                    if (matchAnyURL(query.url, denyAbsURLs)) {
                        changed = true;
                        return false;
                    } else {
                        return true;
                    }
                });
                _this.notifyChanges(changed);
            }
        });
    });
};

/**
 * Return an authorization token for the given URL
 *
 * @param  {String} url
 *
 * @return {String|undefined}
 */
prototype.getToken = function(url) {
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

/**
 * Get authorization token for URL and attach it to options for fetch()
 *
 * @param  {String} url
 * @param  {Object} options
 *
 * @return {Object}
 */
prototype.includeToken = function(url, options) {
    var token = this.getToken(url);
    return this.attachToken(token, options);
}

/**
 * Attach authorization token to options for fetch()
 *
 * @param  {String} token
 * @param  {Object} options
 *
 * @return {Object}
 */
prototype.attachToken = function(token, options) {
    if (token) {
        var keyword = this.options.authorizationKeyword;
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['Authorization'] = keyword + ' ' + token;
    }
    return options;
}

prototype.waitForResults = function(promises) {
    var _this = this;
    var results = [];
    var errors = [];
    var firstError = null;
    promises = promises.map(function(promise, index) {
        if (promise.then instanceof Function) {
            return promise.then(function(result) {
                results[index] = result;
                errors[index] = null;
            }, function(err) {
                results[index] = null;
                errors[index] = err;
                if (!firstError) {
                    firstError = err;
                }
            });
        } else {
            results[index] = promise;
            errors[index] = null;
            return null;
        }
    });
    this.stopExpirationCheck();
    return Promise.all(promises).then(function() {
        _this.startExpirationCheck();
        if (firstError) {
            firstError.results = results;
            firstError.errors = errors;
        }
        return {
            results: results,
            errors: errors,
            error: firstError,
        };
    });
}

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
 * Mark queries as expired and trigger onChange event when enough time has passed
 */
prototype.checkExpiration = function() {
    var interval = Number(this.options.refreshInterval);
    if (!interval) {
        return;
    }
    var time = getTime(-interval);
    this.invalidate(time);
};

/**
 * Perform an HTTP GET operation
 *
 * @param  {String} url
 *
 * @return {Promise<Object>}
 */
prototype.get = function(url) {
    var options = this.includeToken(url, {
        method: 'GET',
    });
    return this.request(url, options, true);
};

/**
 * Perform an HTTP POST operation
 *
 * @param  {String} url
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.post = function(url, object) {
    var options = this.includeToken(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    });
    return this.request(url, options, true);
};

/**
 * Perform an HTTP PUT operation
 *
 * @param  {String} url
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
prototype.put = function(url, object) {
    var options = this.includeToken(url, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(object),
    });
    return this.request(url, options, true);
};

/**
 * Perform an HTTP DELETE operation
 *
 * @param  {String} url
 *
 * @return {Promise<null>}
 */
prototype.delete = function(url) {
    var options = this.includeToken(url, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
    });
    return this.request(url, options, true);
};

/**
 * Perform an HTTP request
 *
 * @param  {String} url
 * @param  {Object} options
 * @param  {Boolean} waitForAuthentication
 *
 * @return {Promise}
 */
prototype.request = function(url, options, waitForAuthentication) {
    var _this = this;
    return fetch(url, options).then(function(response) {
        if (response.status < 400) {
            if (response.status == 204) {
                return null;
            }
            return response.json();
        } else if (response.status === 401 && waitForAuthentication) {
            return _this.requestAuthentication(url).then(function(token) {
                if (token) {
                    _this.attachToken(token, options);
                    return _this.request(url, options, false);
                } else {
                    throw new RelaksDjangoDataSourceError(response.status, response.statusText);
                }
            });
        } else {
            throw new RelaksDjangoDataSourceError(response.status, response.statusText);
        }
    });
};

/**
 * Run hook function on an cached fetch query after an insert, update, or
 * delete operation. Return true when query is changed.
 *
 * @param  {Object} query
 * @param  {String} hookName
 * @param  {Array<Object>|Object} input
 * @param  {String} defaultBehavior
 *
 * @return {Boolean}
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
                    case 'object::remove':
                        hookFunc = removeObject;
                        break;
                    case 'list::remove':
                    case 'page::remove':
                        hookFunc = removeObjects;
                        break;
                    default:
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn('Unknown hook "' + hookFunc + '"');
                        }
                        hookFunc = refreshQuery;
                }
        }
    }
    if (query.type === 'object') {
        // refresh the query if anything is amiss
        var impact = true;
        if (query.object && input) {
            try {
                impact = hookFunc(query.object, input);
            } catch (err) {
                console.error(err);
            }
        }
        if (impact === false) {
            return false;
        }
        if (impact instanceof Object) {
            var object = impact;
            query.object = object;
            query.promise = Promise.resolve(object);
        } else {
            query.expired = true;
        }
        return true;
    } else if (query.type === 'page' || query.type === 'list') {
        var impact = true;
        if (query.objects && input.every(Boolean)) {
            // sort list by ID or URL
            sortObjects(input);
            try {
                impact = hookFunc(query.objects, input);
            } catch (err) {
                console.error(err);
            }
        }
        if (impact === false) {
            return false;
        }
        if (impact instanceof Array) {
            var objects = impact;
            if (query.type === 'list') {
                // update the total
                var diff = objects.length - query.objects.length;
                objects.total = query.objects.total + diff;

                if (query.type === 'list') {
                    // restore more function
                    objects.more = query.objects.more;
                }
            }
            query.objects = objects;
            query.promise = Promise.resolve(objects);
        } else {
            query.expired = true;
        }
        return true;
    }
}

/**
 * Return false to indicate that change should be ignored
 *
 * @return {false}
 */
function ignoreChange() {
    return false;
}

/**
 * Return true to indicate that query should be rerun
 *
 * @return {true}
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
    var newList = objects.slice();
    newObjects.forEach(function(object) {
        newList.unshift(object);
    });
    return newList;
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
    var newList = objects.slice();
    newObjects.forEach(function(object) {
        newList.push(object);
    });
    return newList;
}

/**
 * Return true to indicate that query should be removed
 *
 * @param  {Object} object
 * @param  {Object} deletedObject
 *
 * @return {true}
 */
function removeObject(object, deletedObject) {
    return true;
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
 * Remove trailing slash from URL
 *
 * @param  {String} url
 *
 * @return {String}
 */
function removeTrailingSlash(url) {
    var lc = url.charAt(url.length - 1);
    if (lc === '/') {
        url = url.substr(0, url.length - 1);
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
        url = '/' + url;
    }
    return url;
}

function addTrailingSlash(url) {
    var qi = url.indexOf('?');
    var query;
    if (qi !== -1) {
        query = url.substr(qi);
        url = url.substr(0, qi);
    }
    var lc = url.charAt(url.length - 1);
    if (lc !== '/') {
        url += '/';
    }
    if (query) {
        url += query;
    }
    return url;
}

/**
 * Return the URL of the parent folder
 *
 * @param  {String} url
 *
 * @return {String|undefined}
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

/**
 * Return the URL of an object
 *
 * @param  {String|null} folderURL
 * @param  {Object} object
 *
 * @return {String|undefined}
 */
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

/**
 * Return the URL of the folder containing the URL
 *
 * @param  {String|null} folderURL
 * @param  {Object} object
 *
 * @return {String|undefined}
 */
function getObjectFolderURL(folderURL, object) {
    if (!object) {
        return;
    }
    if (folderURL) {
        return omitSearchString(folderURL);
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
    return url + sep + 'page=' + page;
}

function omitSearchString(url) {
    var qi = url.lastIndexOf('?');
    if (qi !== -1) {
        url = url.substr(0, qi);
    }
    return url;
}

/**
 * Return true if one URL points to a subfolder of another URL
 *
 * @param  {String} url
 * @param  {String} otherURL
 *
 * @return {Boolean}
 */
function matchURL(url, otherURL) {
    url = omitSearchString(url);
    if (otherURL === url) {
        return true;
    } else if (url.substr(0, otherURL.length) === otherURL) {
        var lc = otherURL.charAt(otherURL.length - 1);
        var ec = url.charAt(otherURL.length);
        if (lc === '/' || ec === '/') {
            return true;
        }
    }
    return false;
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
        return matchURL(url, otherURL);
    });
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
        var keyB = list[i].id || list[i].url;
        if (keyA === keyB) {
            return i;
        }
    }
    return -1;
}

/**
 * Find an object in a list based on id or URL
 *
 * @param  {Array<Object>} list
 * @param  {Object} object
 * @param  {Boolean|undefined} different
 *
 * @return {Object|undefined}
 */
function findObject(list, object, different) {
    if (object) {
        var index = findObjectIndex(list, object);
        if (index !== -1) {
            var objectFound = list[index];
            if (different) {
                // allow object to have fewer properties than those in
                // the list
                for (var name in object) {
                    if (!matchObject(object[name], objectFound[name])) {
                        return objectFound;
                    }
                }
            } else {
                return objectFound;
            }
        }
    }
}

/**
 * Find objects in a list
 *
 * @param  {Array<Object>} list
 * @param  {Array<Object>} objects
 * @param  {Boolean|undefined} different
 *
 * @return {Array<Object>|undefined}
 */
function findObjects(list, objects, different) {
    if (objects) {
        var found = [];
        for (var i = 0; i < objects.length; i++) {
            var objectFound = findObject(list, objects[i], different);
            if (objectFound) {
                found.push(objectFound);
            }
        }
        if (found.length > 0) {
            return found;
        }
    }
}

function excludeObjects(list, objects) {
    list = list.slice(0);
    if (objects) {
        var found = [];
        for (var i = 0; i < objects.length; i++) {
            var index = findObjectIndex(list, objects[i]);
            if (index !== -1) {
                list.splice(index, 1);
            }
        }
    }
    if (list.length > 0) {
        return list;
    }
}

/**
 * Clone an object
 *
 * @param  {*} src
 *
 * @return {*}
 */
function cloneObject(src) {
    var dst;
    if (src instanceof Array) {
        dst = [];
        for (var i = 0; i < src.length; i++) {
            dst.push(cloneObject(src[i]));
        }
        return dst;
    } else if (src instanceof Object) {
        dst = {};
        for (var name in src) {
            dst[name] = cloneObject(src[name]);
        }
    } else {
        dst = src;
    }
    return dst;
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
 * Return objects that are not found in the old list or undefined if there are
 * no change
 *
 * @param  {Array<Object>} newList
 * @param  {Array<Object>} oldList
 *
 * @return {Array<Object>|undefined}
 */
function replaceIdentificalObjects(newList, oldList) {
    var freshObjects = [];
    var changed = false;
    for (var i = 0; i < newList.length; i++) {
        var oldIndex = findObjectIndex(oldList, newList[i]);
        if (oldIndex !== -1) {
            if (matchObject(newList[i], oldList[oldIndex])) {
                newList[i] = oldList[oldIndex];
                if (i !== oldIndex) {
                    changed = true;
                }
            } else {
                freshObjects.push(newList[i]);
                changed = true;
            }
        } else {
            freshObjects.push(newList[i]);
            changed = true;
        }
    }
    if (changed) {
        return freshObjects;
    }
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
 * Separate objects by folder and whether the operation succeeded
 *
 * @param  {String|null} folderURL
 * @param  {Array<Object>} objects
 * @param  {Object} outcome
 *
 * @return {Object<Array>}
 */
function segregateResults(folderURL, objects, outcome) {
    var opHash = {};
    var ops = [];
    for (var i = 0; i < objects.length; i++) {
        var object = objects[i];
        var result = outcome.results[i];
        var error = outcome.errors[i];
        var objectFolderURL = getObjectFolderURL(folderURL, object);
        var op = opHash[objectFolderURL];
        if (!op) {
            op = opHash[objectFolderURL] = {
                url: objectFolderURL,
                results: null,
                rejects: null
            };
            ops.push(op);
        };
        if (result) {
            if (!op.results) {
                op.results = [];
            }
            op.results.push(result);
        } else {
            if (error) {
                switch (error.status) {
                    case 404:
                    case 410:
                    case 409:
                        if (!op.rejects) {
                            op.rejects = [];
                        }
                        op.rejects.push(object);
                        break;
                }
            }
        }
    }
    return ops;
}

/**
 * Get parameter 'minimum' from options. If it's a percent, then calculate the
 * minimum object count based on total. If it's negative, substract the value
 * from the total.
 *
 * @param  {Object} options
 * @param  {Number} total
 * @param  {Number} def
 *
 * @return {Number}
 */
function getMinimum(options, total, def) {
    var minimum = (options) ? options.minimum : undefined;
    if (typeof(minimum) === 'string') {
        minimum = minimum.trim();
        if (minimum.charAt(minimum.length - 1) === '%') {
            var percent = parseInt(minimum);
            minimum = Math.ceil(total * (percent / 100));
        }
    }
    if (minimum < 0) {
        minimum = total + minimum;
        if (minimum < 1) {
            minimum = 1;
        }
    }
    return minimum || def;
}

/**
 * Return the current time in ISO format, adding a delta optionally
 *
 * @param  {Number|undefined} delta
 *
 * @return {String}
 */
function getTime(delta) {
    var date = new Date;
    if (delta) {
        date = new Date(date.getTime() + delta);
    }
    return date.toISOString();
}

function RelaksDjangoDataSourceEvent(type, target, props) {
    GenericEvent.call(this, type, target, props);
}

RelaksDjangoDataSourceEvent.prototype = Object.create(GenericEvent.prototype)

function RelaksDjangoDataSourceError(status, message) {
    this.status = status;
    this.message = message;
}

RelaksDjangoDataSourceError.prototype = Object.create(Error.prototype)

module.exports = RelaksDjangoDataSource;
module.exports.RelaksDjangoDataSource = RelaksDjangoDataSource;
module.exports.RelaksDjangoDataSourceEvent = RelaksDjangoDataSourceEvent;
module.exports.RelaksDjangoDataSourceError = RelaksDjangoDataSourceError;
