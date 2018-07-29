module.exports = function(React, PropTypes) {

RelaksDjangoDataSource.prototype = Object.create(React.Component.prototype);
RelaksDjangoDataSource.prototype.constructor = RelaksDjangoDataSource;

if (process.env.NODE_ENV !== 'production' && PropTypes) {
    RelaksDjangoDataSource.propTypes = {
        onChange: PropTypes.func.isRequired,
    }
}

/**
 * Set initial state of component
 */
function RelaksDjangoDataSource() {
    var _this = this;
    React.Component.call(_this);
    _this.requests = [];
    _this.state = { requests: _this.requests };
}

/**
 * Don't render anything
 *
 * @return {null}
 */
RelaksDjangoDataSource.prototype.render = function() {
    return null;
};

/**
 * Trigger onChange on mount
 */
RelaksDjangoDataSource.prototype.componentDidMount = function() {
    var _this = this;
    _this.triggerChangeEvent();
};

/**
 * Call the onChange handler
 */
RelaksDjangoDataSource.prototype.triggerChangeEvent = function() {
    var _this = this;
    if (_this.props.onChange) {
        _this.props.onChange({ type: 'change', target: _this });
    }
};

/**
 * Fetch one object at the URL.
 *
 * @param  {String} url
 *
 * @return {Promise<Object>}
 */
RelaksDjangoDataSource.prototype.fetchOne = function(url) {
    var _this = this;
    return _this.fetch(url);
};

/**
 * Fetch a list of objects at the given URL. If page is specified in
 * options, then objects in that page are returned. Otherwise object from
 * the all objects are returned through multiple calls. A method named
 * more() will be attached to be array, which initially contains only
 * objects in the first page. Calling .more() retrieves the those in the
 * next unretrieved page.
 *
 * @param  {String} url
 * @param  {Object|undefined} options
 *
 * @return {Promise<Array>}
 */
RelaksDjangoDataSource.prototype.fetchList= function(url, options) {
    var _this = this;
    var page = (options && options.page !== undefined) ? options.page : 0;
    if (page) {
        // fetch a page if page number is specified
        url = appendPage(url, page);
        return _this.fetch(url).then(function(response) {
            return response.results;
        });
    } else {
        // fetch pages on demand, concatenating them
        var props = { url: url, list: true };
        var request = _this.findRequest(props);
        if (!request) {
            request = _this.addRequest(props)

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
                    // append retrieved objects to list
                    var results = previousResults.concat(response.results);
                    var promise = Promise.resolve(results);
                    _this.updateRequest(request, { results, promise });

                    // attach function to results so caller can ask for more results
                    results.more = fetchNextPage;

                    // set up the next call
                    nextURL = response.next;
                    previousResults = results;
                    currentPromise = (nextURL) ? null : promise;

                    // inform parent component that more data is available
                    if (currentPage++ > 1) {
                        _this.triggerChangeEvent();
                    }
                    return results;
                }).catch(function(err) {
                    currentPromise = null;
                    throw err;
                });
                return currentPromise;
            };

            // call it for the first page
            request.promise = fetchNextPage();
        }
        return request.promise;
    }
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
RelaksDjangoDataSource.prototype.fetchMultiple = function(urls, options) {
    // see which ones are cached already
    var _this = this;
    var results = {};
    var cached = 0;
    var promises = urls.map(function(url) {
        var request = _this.findRequest({ url, list: false });
        if (request && request.result) {
            results[url] = request.result;
            cached++;
        } else {
            return _this.fetchOne(url);
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
        minimum = urls.length * partial;
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
RelaksDjangoDataSource.prototype.fetch = function(url) {
    var _this = this;
    var props = { url: url, list: false };
    var request = _this.findRequest(props);
    if (!request) {
        request = _this.addRequest(props)
        request.promise = fetch(url).then(function(response) {
            return response.json().then(function(result) {
                _this.updateRequest(request, { result: result });
                return result;
            });
        });
    }
    return request.promise;
};

/**
 * Find an existing request
 *
 * @param  {Object} props
 *
 * @return {Object|undefined}
 */
RelaksDjangoDataSource.prototype.findRequest = function(props) {
    var _this = this;
    return _this.requests.find(function(request) {
        return match(request, props);
    });
};

/**
 * Add a request
 *
 * @param {Object} props
 */
RelaksDjangoDataSource.prototype.addRequest = function(props) {
    var _this = this;
    var request = Object.assign({ promise: null }, props);
    _this.requests = [ request ].concat(_this.requests);
    _this.setState({ requests: _this.requests });
    return request;
};

/**
 * Update a request
 *
 * @param  {Object} request
 * @param  {Object} props
 */
RelaksDjangoDataSource.prototype.updateRequest = function(request, props) {
    var _this = this;
    Object.assign(request, props);
    _this.requests = _this.requests.slice();
    _this.setState({ requests: _this.requests });
};

return RelaksDjangoDataSource;
};

function match(request, props) {
    for (var name in props) {
        if (request[name] !== props[name]) {
            return false;
        }
    }
    return true;
}

function appendPage(url, page) {
    if (page === 1) {
        return url;
    } else {
        var qi = url.indexOf('?');
        var sep = (qi === -1) ? '?' : '&';
        return url + sep + 'page=' + page;
    }
}
