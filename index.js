(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.RelaksRouteManager = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    return Constructor;
  }

  var RelaksEventEmitter =
  /*#__PURE__*/
  function () {
    function RelaksEventEmitter() {
      _classCallCheck$1(this, RelaksEventEmitter);

      this.listeners = [];
      this.promises = [];
    }
    /**
     * Attach an event handler
     *
     * @param  {String} type
     * @param  {Function} handler
     * @param  {Boolean|undefined} beginning
     */


    _createClass$1(RelaksEventEmitter, [{
      key: "addEventListener",
      value: function addEventListener(type, handler, beginning) {
        if (typeof type !== 'string') {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Invalid event type passed to addEventListener()');
          }

          return;
        }

        if (!(handler instanceof Function) && handler != null) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Non-function passed to addEventListener()');
          }

          return;
        }

        if (beginning) {
          this.listeners.unshift({
            type: type,
            handler: handler
          });
        } else {
          this.listeners.push({
            type: type,
            handler: handler
          });
        }
      }
      /**
       * Remove an event handler
       *
       * @param  {String} type
       * @param  {Function} handler
       */

    }, {
      key: "removeEventListener",
      value: function removeEventListener(type, handler) {
        this.listeners = this.listeners.filter(function (listener) {
          return !(listener.type === type && listener.handler === handler);
        });
      }
      /**
       * Return a promise that will be fulfilled when the specified event occurs
       *
       * @param  {String} type
       * @param  {Number|undefined} timeout
       *
       * @return {Promise<Event>}
       */

    }, {
      key: "waitForEvent",
      value: function waitForEvent(type, timeout) {
        var promise = this.promises[type];

        if (!promise) {
          var resolve, reject;
          promise = new Promise(function (f1, f2) {
            resolve = f1;
            reject = f2;
          });
          promise.resolve = resolve;
          promise.reject = reject;
          this.promises[type] = promise;

          if (timeout) {
            setTimeout(function () {
              if (promise.reject) {
                promise.reject(new Error("No '".concat(type, "' event within ").concat(timeout, "ms")));
              }
            }, timeout);
          }
        }

        return promise;
      }
      /**
       * Send event to event listeners, return true or false depending on whether
       * there were any listeners
       *
       * @param  {RelaksDjangoDataSourceEvent} evt
       *
       * @return {Boolean}
       */

    }, {
      key: "triggerEvent",
      value: function triggerEvent(evt) {
        var promise = this.promises[evt.type];

        if (promise) {
          delete this.promises[evt.type];
        }

        var listeners = this.listeners.filter(function (listener) {
          return listener.type === evt.type;
        });

        if (listeners.length === 0) {
          if (promise) {
            promise.reject = null;
            promise.resolve(evt);
            return true;
          } else {
            return false;
          }
        }

        evt.decisionPromise = this.dispatchEvent(evt, listeners).then(function () {
          if (promise) {
            promise.reject = null;
            promise.resolve(evt);
          }
        });
        return true;
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(evt, listeners) {
        var _this = this;

        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          listener.handler.call(evt.target, evt);

          if (evt.defaultPostponed) {
            var _ret = function () {
              var remainingListeners = listeners.slice(i + 1);
              return {
                v: evt.defaultPostponed.then(function (decision) {
                  if (decision === false) {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                  }

                  if (!evt.propagationStopped) {
                    return _this.dispatchEvent(evt, remainingListeners);
                  }
                })
              };
            }();

            if (_typeof$1(_ret) === "object") return _ret.v;
          }

          if (evt.propagationStopped) {
            break;
          }
        }

        return Promise.resolve();
      }
    }]);

    return RelaksEventEmitter;
  }();

  var RelaksGenericEvent =
  /*#__PURE__*/
  function () {
    function RelaksGenericEvent(type, target, props) {
      _classCallCheck$1(this, RelaksGenericEvent);

      this.type = type;
      this.target = target;
      this.defaultPrevented = false;
      this.defaultPostponed = null;
      this.propagationStopped = false;
      this.decisionPromise = null;
      Object.assign(this, props);
    }

    _createClass$1(RelaksGenericEvent, [{
      key: "preventDefault",
      value: function preventDefault() {
        this.defaultPrevented = true;
      }
    }, {
      key: "postponeDefault",
      value: function postponeDefault(promise) {
        if (promise instanceof Function) {
          promise = promise();
        }

        if (!promise || !(promise.then instanceof Function)) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Non-promise passed to postponeDefault()');
          }

          return;
        }

        this.defaultPostponed = promise;
      }
    }, {
      key: "stopImmediatePropagation",
      value: function stopImmediatePropagation() {
        this.propagationStopped = true;
      }
    }, {
      key: "waitForDecision",
      value: function waitForDecision() {
        return Promise.resolve(this.decisionPromise);
      }
    }]);

    return RelaksGenericEvent;
  }();

  var RelaksDjangoDataSourceError =
  /*#__PURE__*/
  function (_Error) {
    _inherits(RelaksDjangoDataSourceError, _Error);

    function RelaksDjangoDataSourceError(status, message) {
      var _this;

      _classCallCheck(this, RelaksDjangoDataSourceError);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RelaksDjangoDataSourceError).call(this, message));
      _this.status = status;
      _this.message = message;
      return _this;
    }

    return RelaksDjangoDataSourceError;
  }(_wrapNativeSuper(Error));

  var RelaksDjangoDataSourceEvent =
  /*#__PURE__*/
  function (_GenericEvent) {
    _inherits(RelaksDjangoDataSourceEvent, _GenericEvent);

    function RelaksDjangoDataSourceEvent() {
      _classCallCheck(this, RelaksDjangoDataSourceEvent);

      return _possibleConstructorReturn(this, _getPrototypeOf(RelaksDjangoDataSourceEvent).apply(this, arguments));
    }

    return RelaksDjangoDataSourceEvent;
  }(RelaksGenericEvent);

  var defaultOptions = {
    baseURL: '',
    refreshInterval: 0,
    authorizationKeyword: 'Token',
    abbreviatedFolderContents: false,
    fetchFunc: null
  };

  var RelaksDjangoDataSource =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(RelaksDjangoDataSource, _EventEmitter);

    function RelaksDjangoDataSource(options) {
      var _this;

      _classCallCheck(this, RelaksDjangoDataSource);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RelaksDjangoDataSource).call(this));
      _this.active = false;
      _this.activationPromise = null;
      _this.queries = [];
      _this.authentications = [];
      _this.authorizations = [];
      _this.options = {};

      for (var name in defaultOptions) {
        if (options && options[name] !== undefined) {
          _this.options[name] = options[name];
        } else {
          _this.options[name] = defaultOptions[name];
        }
      }

      return _this;
    }
    /**
     * Activate the component
     */


    _createClass(RelaksDjangoDataSource, [{
      key: "activate",
      value: function activate() {
        if (!this.active) {
          this.active = true;

          if (this.activationPromise) {
            var resolve = this.activationPromise.resolve;
            this.activationPromise = null;
            resolve();
          }

          this.startExpirationCheck();
          this.checkExpiration();
        }
      }
      /**
       * Deactivate the component
       */

    }, {
      key: "deactivate",
      value: function deactivate() {
        if (this.active) {
          this.stopExpirationCheck();
          this.active = false;
        }
      }
      /**
       * Add baseURL to relative URL
       *
       * @param  {String} url
       *
       * @return {String}
       */

    }, {
      key: "resolveURL",
      value: function resolveURL(url) {
        if (typeof url !== 'string') {
          return url;
        }

        var baseURL = this.options.baseURL;

        if (baseURL && !/^https?:/.test(url)) {
          if (!/^https?:/.test(baseURL)) {
            if ((typeof location === "undefined" ? "undefined" : _typeof(location)) === 'object') {
              var _location = location,
                  protocol = _location.protocol,
                  host = _location.host;
              baseURL = "".concat(protocol, "//").concat(host).concat(baseURL);
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
      }
      /**
       * Resolve a list of URLs
       *
       * @param  {Array<String>} urls
       *
       * @return {Array<String>}
       */

    }, {
      key: "resolveURLs",
      value: function resolveURLs(urls) {
        var _this2 = this;

        return urls.map(function (url) {
          return _this2.resolveURL(url);
        });
      }
      /**
       * Trigger a 'change' event unless changed is false
       *
       * @param  {Boolean} changed
       *
       * @return {Boolean}
       */

    }, {
      key: "notifyChanges",
      value: function notifyChanges(changed) {
        if (changed === false) {
          return false;
        }

        this.triggerEvent(new RelaksDjangoDataSourceEvent('change', this));
        return true;
      }
      /**
       * Fetch one object at the URL.
       *
       * @param  {String} url
       * @param  {Object|undefined} options
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "fetchOne",
      value: function fetchOne(url, options) {
        var _this3 = this;

        var absURL = this.resolveURL(url);
        var props = {
          type: 'object',
          url: absURL,
          options: options || {}
        };
        var query = this.findQuery(props);

        if (!query) {
          query = this.deriveQuery(absURL, true);
        }

        if (!query) {
          var time = getTime();
          query = props;
          query.promise = this.get(absURL).then(function (response) {
            var object = response;
            query.object = object;
            query.time = time;

            _this3.processFreshObject(object, absURL, query, true);

            return object;
          });
          this.queries.unshift(query);
        }

        return query.promise.then(function (object) {
          if (query.expired) {
            _this3.refreshOne(query);
          }

          return object;
        });
      }
      /**
       * Fetch a page of objects
       *
       * @param  {String} url
       * @param  {Number} page
       * @param  {Object|undefined} options
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "fetchPage",
      value: function fetchPage(url, page, options) {
        var _this4 = this;

        var absURL = this.resolveURL(url);
        var props = {
          type: 'page',
          url: absURL,
          page: page,
          options: options || {}
        };
        var query = this.findQuery(props);

        if (!query) {
          var pageURL = attachPageNumber(absURL, page);
          var time = getTime();
          query = props;
          query.promise = this.get(pageURL).then(function (response) {
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

            _this4.processFreshObjects(objects, pageURL, query, true);

            return objects;
          });
          this.queries.push(query);
        }

        return query.promise.then(function (objects) {
          if (query.expired) {
            _this4.refreshPage(query);
          }

          return objects;
        });
      }
      /**
       * Fetch a list of objects at the given URL.
       *
       * @param  {String} url
       * @param  {Object} options
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "fetchList",
      value: function fetchList(url, options) {
        var _this5 = this;

        var absURL = this.resolveURL(url);
        var props = {
          type: 'list',
          url: absURL,
          options: options || {}
        };
        var query = this.findQuery(props);

        if (!query) {
          query = props;
          query.promise = this.fetchNextPage(query, true);
          this.queries.push(query);
        }

        return query.promise.then(function (objects) {
          if (query.expired) {
            _this5.refreshList(query);
          }

          return objects;
        });
      }
      /**
       * Return what has been fetched. Used by fetchList().
       *
       * @param  {Object} query
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "fetchNoMore",
      value: function fetchNoMore(query) {
        return query.promise;
      }
      /**
       * Initiate fetching of the next page. Used by fetchList().
       *
       * @param  {Object} query
       * @param  {Boolean} initial
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "fetchNextPage",
      value: function fetchNextPage(query, initial) {
        var _this6 = this;

        if (query.nextPromise) {
          return query.nextPromise;
        }

        var time = getTime();
        var nextURL = initial ? query.url : query.nextURL;
        var nextPromise = this.get(nextURL).then(function (response) {
          if (response instanceof Array) {
            // the full list is returned
            var objects = response;
            objects.more = _this6.fetchNoMore.bind(_this6, query);
            objects.total = objects.length;
            query.objects = objects;
            query.time = time;
            query.nextPromise = null;

            _this6.processFreshObjects(objects, nextURL, query, true);

            return objects;
          } else if (response instanceof Object) {
            // append retrieved objects to list
            var total = response.count;
            var freshObjects = response.results;

            var _objects = appendObjects(query.objects, freshObjects);

            query.objects = _objects;
            query.promise = nextPromise;
            query.nextPromise = null;
            query.nextURL = response.next;
            query.nextPage = (query.nextPage || 1) + 1;

            if (initial) {
              query.time = time;
            }

            _this6.processFreshObjects(freshObjects, nextURL, query, initial); // attach function to results so caller can ask for more results


            if (query.nextURL) {
              _objects.more = _this6.fetchNextPage.bind(_this6, query, false);
              _objects.total = total; // if minimum is provide, fetch more if it's not met

              var minimum = getMinimum(query.options, total, NaN);

              if (_objects.length < minimum) {
                // fetch the next page
                return _this6.fetchNextPage(query, false);
              }
            } else {
              _objects.more = _this6.fetchNoMore.bind(_this6, query);
              _objects.total = _objects.length;
            } // inform parent component that more data is available


            _this6.notifyChanges(!initial);

            return _objects;
          }
        })["catch"](function (err) {
          if (!initial) {
            query.nextPromise = null;
          }

          throw err;
        });

        if (!initial) {
          query.nextPromise = nextPromise;
        }

        return nextPromise;
      }
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

    }, {
      key: "fetchMultiple",
      value: function fetchMultiple(urls, options) {
        var _this7 = this;

        // see which ones are cached already
        var cached = 0;
        var fetchOptions = {};

        for (var name in options) {
          if (name !== 'minimum') {
            fetchOptions[name] = options[name];
          }
        }

        var cachedResults = [];
        var promises = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = urls[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var url = _step.value;
            var absURL = this.resolveURL(url);
            var props = {
              url: absURL,
              type: 'object',
              options: fetchOptions
            };
            var query = this.findQuery(props);

            if (!query) {
              query = this.deriveQuery(absURL, true);
            }

            if (query && query.object) {
              cached++;
              cachedResults.push(query.object);
              promises.push(query.object);
            } else {
              cachedResults.push(null);
              promises.push(this.fetchOne(absURL, fetchOptions));
            }
          } // wait for the complete list to arrive

        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var completeListPromise;

        if (cached < urls.length) {
          completeListPromise = this.waitForResults(promises).then(function (outcome) {
            if (outcome.error) {
              throw outcome.error;
            }

            return outcome.results;
          });
        } // see whether partial result set should be immediately returned


        var minimum = getMinimum(options, urls.length, urls.length);

        if (cached < minimum && completeListPromise) {
          return completeListPromise;
        } else {
          if (completeListPromise) {
            // return partial list then fire change event when complete list arrives
            completeListPromise.then(function (objects) {
              _this7.notifyChanges(true);
            });
          }

          return Promise.resolve(cachedResults);
        }
      }
      /**
       * Reperform an query for an object, triggering an onChange event if the
       * object has changed.
       *
       * @param  {Object} query
       */

    }, {
      key: "refreshOne",
      value: function refreshOne(query) {
        var _this8 = this;

        if (query.refreshing) {
          return;
        }

        query.refreshing = true;
        var time = getTime();
        this.get(query.url).then(function (response) {
          var object = response;
          query.time = time;
          query.refreshing = false;
          query.expired = false;

          if (!matchObject(object, query.object)) {
            query.object = object;
            query.promise = Promise.resolve(object);

            _this8.processFreshObject(object, query.url, query, false);

            _this8.notifyChanges(true);
          }
        })["catch"](function (err) {
          query.refreshing = false;
        });
      }
      /**
       * Reperform an query for a page of objects, triggering an onChange event if
       * the list is different from the one fetched previously.
       *
       * @param  {Object} query
       */

    }, {
      key: "refreshPage",
      value: function refreshPage(query) {
        var _this9 = this;

        if (query.refreshing) {
          return;
        }

        query.refreshing = true;
        var time = getTime();
        var pageURL = attachPageNumber(query.url, query.page);
        this.get(pageURL).then(function (response) {
          var objects, total;

          if (response instanceof Array) {
            objects = response;
            total = response.length;
          } else {
            objects = response.results;
            total = response.count;
          } // remove other pages (unless they're refreshing)


          var otherQueries = [];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _this9.queries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var otherQuery = _step2.value;

              if (otherQuery.url === query.url) {
                if (otherQuery.page !== query.page) {
                  if (otherQuery.expired && !otherQuery.refreshing) {
                    otherQueries.push(otherQuery);
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          pullObjects(_this9.queries, otherQueries);
          setTimeout(function () {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = otherQueries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _step3$value = _step3.value,
                    url = _step3$value.url,
                    page = _step3$value.page,
                    options = _step3$value.options;

                _this9.fetchPage(url, page, options);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }, 1000);
          query.time = time;
          query.refreshing = false;
          query.expired = false;
          var freshObjects = replaceIdentificalObjects(objects, query.objects);

          if (freshObjects) {
            objects.total = total;
            query.objects = objects;
            query.promise = Promise.resolve(objects);

            _this9.processFreshObjects(freshObjects, pageURL, query, false);

            _this9.notifyChanges(true);
          }
        })["catch"](function (err) {
          query.refreshing = false;
        });
      }
      /**
       * Reperform an query for a list of objects, triggering an onChange event if
       * the list is different from the one fetched previously.
       *
       * @param  {Object} query
       */

    }, {
      key: "refreshList",
      value: function refreshList(query) {
        var _this10 = this;

        if (query.refreshing) {
          return;
        }

        query.refreshing = true;

        if (query.nextPage) {
          // updating paginated list
          // wait for any call to more() to finish first
          Promise.resolve(query.nextPromise).then(function () {
            // suppress fetching of additional pages for the time being
            var oldObjects = query.objects;
            var morePromise, moreResolve, moreReject;

            var fetchMoreAfterward = function fetchMoreAfterward() {
              if (!morePromise) {
                morePromise = new Promise(function (resolve, reject) {
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

            var refreshNextPage = function refreshNextPage() {
              return _this10.get(nextURL).then(function (response) {
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

                  _this10.processFreshObjects(freshObjects, query.url, query, false);

                  _this10.notifyChanges(true);
                } // keep going until all pages have been updated


                if (query.nextURL !== nextURL) {
                  return refreshNextPage();
                }
              });
            };

            var time = getTime();
            refreshNextPage().then(function () {
              // we're done
              query.time = time;
              query.refreshing = false;
              query.expired = false; // reenable fetching of additional pages

              if (query.nextURL) {
                query.objects.more = _this10.fetchNextPage.bind(_this10, query, false);
              } else {
                query.objects.more = _this10.fetchNoMore.bind(_this10, query);
              } // trigger it if more() had been called


              if (morePromise) {
                query.objects.more().then(moreResolve, moreReject);
              }
            })["catch"](function (err) {
              query.refreshing = false;
            });
          });
        } else {
          // updating un-paginated list
          var time = getTime();
          this.get(query.url).then(function (response) {
            var objects = response;
            query.time = time;
            query.refreshing = false;
            query.expired = false;
            var freshObjects = replaceIdentificalObjects(objects, query.objects);

            if (freshObjects) {
              objects.more = _this10.fetchNoMore.bind(_this10, query);
              objects.total = objects.length;
              query.objects = objects;
              query.promise = Promise.resolve(objects);

              _this10.processFreshObjects(freshObjects, query.url, query, false);

              _this10.notifyChanges(true);
            }
          })["catch"](function (err) {
            query.refreshing = false;
            throw err;
          });
        }
      }
    }, {
      key: "processFreshObject",
      value: function processFreshObject(object, objectURL, excludeQuery, notify) {
        var op = {
          url: getFolderURL(objectURL),
          results: [object],
          rejects: [],
          query: excludeQuery
        };
        var changed = this.runUpdateHooks(op);

        if (notify) {
          this.notifyChanges(changed);
        }

        return changed;
      }
    }, {
      key: "processFreshObjects",
      value: function processFreshObjects(objects, folderURL, excludeQuery, notify) {
        var op = {
          url: omitSearchString(folderURL),
          results: objects,
          rejects: [],
          query: excludeQuery
        };
        var changed = this.runUpdateHooks(op);

        if (notify) {
          this.notifyChanges(changed);
        }

        return changed;
      }
      /**
       * Insert an object into remote database
       *
       * @param  {String} folderURL
       * @param  {Object} object
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "insertOne",
      value: function insertOne(folderURL, object) {
        return this.insertMultiple(folderURL, [object]).then(function (insertedObjects) {
          return insertedObjects[0];
        });
      }
      /**
       * Insert multiple objects into remote database
       *
       * @param  {String} folderURL
       * @param  {Array<Object>} objects
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "insertMultiple",
      value: function insertMultiple(folderURL, objects) {
        var _this11 = this;

        var folderAbsURL = this.resolveURL(folderURL);
        var promises = objects.map(function (object) {
          return _this11.post(folderAbsURL, object);
        });
        return this.waitForResults(promises).then(function (outcome) {
          var changed = false;
          var ops = segregateResults(folderAbsURL, objects, outcome);
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = ops[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var op = _step4.value;

              if (_this11.runInsertHooks(op)) {
                changed = true;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          _this11.notifyChanges(changed);

          if (outcome.error) {
            throw outcome.error;
          }

          return outcome.results;
        });
      }
      /**
       * Update an object
       *
       * @param  {String} folderURL
       * @param  {Object} object
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "updateOne",
      value: function updateOne(folderURL, object) {
        // allow folderURL to be omitted
        if (object === undefined && folderURL instanceof Object) {
          object = folderURL;
          folderURL = null;
        }

        return this.updateMultiple(folderURL, [object]).then(function (results) {
          return results[0];
        });
      }
      /**
       * Update multiple objects
       *
       * @param  {String} folderURL
       * @param  {Array<Object>} objects
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "updateMultiple",
      value: function updateMultiple(folderURL, objects) {
        var _this12 = this;

        // allow folderURL to be omitted
        if (objects === undefined && folderURL instanceof Array) {
          objects = folderURL;
          folderURL = null;
        }

        var folderAbsURL = this.resolveURL(folderURL);
        var promises = objects.map(function (object) {
          var absURL = getObjectURL(folderAbsURL, object);
          return _this12.put(absURL, object);
        });
        return this.waitForResults(promises).then(function (outcome) {
          var changed = false;
          var ops = segregateResults(folderAbsURL, objects, outcome);
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = ops[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var op = _step5.value;

              if (_this12.runUpdateHooks(op)) {
                changed = true;
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          _this12.notifyChanges(changed);

          if (outcome.error) {
            throw outcome.error;
          }

          return outcome.results;
        });
      }
      /**
       * Delete an object
       *
       * @param  {String} folderURL
       * @param  {Object} object
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "deleteOne",
      value: function deleteOne(folderURL, object) {
        // allow folderURL to be omitted
        if (object === undefined && folderURL instanceof Object) {
          object = folderURL;
          folderURL = null;
        }

        return this.deleteMultiple(folderURL, [object]).then(function (results) {
          return results[0];
        });
      }
      /**
       * Delete multiple objects
       *
       * @param  {String} folderURL
       * @param  {Array<Object>} objects
       *
       * @return {Promise<Array>}
       */

    }, {
      key: "deleteMultiple",
      value: function deleteMultiple(folderURL, objects) {
        var _this13 = this;

        // allow folderURL to be omitted
        if (objects === undefined && folderURL instanceof Array) {
          objects = folderURL;
          folderURL = null;
        }

        var folderAbsURL = this.resolveURL(folderURL);
        var promises = objects.map(function (object) {
          var absURL = getObjectURL(folderAbsURL, object);
          return _this13["delete"](absURL, object).then(function () {
            // create copy of object, as a DELETE op does not return anything
            return cloneObject(object);
          });
        });
        return this.waitForResults(promises).then(function (outcome) {
          var changed = false;
          var ops = segregateResults(folderAbsURL, objects, outcome);
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = ops[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var op = _step6.value;

              if (_this13.runDeleteHooks(op)) {
                changed = true;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          _this13.notifyChanges(changed);

          if (outcome.error) {
            throw outcome.error;
          }

          return outcome.results;
        });
      }
      /**
       * Run insert hooks
       *
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runInsertHooks",
      value: function runInsertHooks(op) {
        var changed = false;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.queries[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var _query = _step7.value;

            if (_query !== op.query) {
              if (this.runInsertHook(_query, op)) {
                changed = true;
              }
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        if (op.results) {
          var time = getTime();
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = op.results[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var newObject = _step8.value;
              var absURL = getObjectURL(op.url, newObject);
              var query = {
                type: 'object',
                url: absURL,
                promise: Promise.resolve(newObject),
                object: newObject,
                time: time
              };
              this.queries.unshift(query);
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }

        return changed;
      }
      /**
       * Run a query's insert hook if its URL matches
       *
       * @param  {Object} query
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runInsertHook",
      value: function runInsertHook(query, op) {
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
      }
      /**
       * Run afterUpdate hooks
       *
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runUpdateHooks",
      value: function runUpdateHooks(op) {
        var changed = false;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.queries[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var query = _step9.value;

            if (query !== op.query) {
              if (this.runUpdateHook(query, op)) {
                changed = true;
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
              _iterator9["return"]();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        return changed;
      }
      /**
       * Run a query's afterUpdate hook if its URL matches
       *
       * @param  {Object} query
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runUpdateHook",
      value: function runUpdateHook(query, op) {
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
          var _defaultBehavior = 'refresh';

          var _queryFolderURL = omitSearchString(query.url);

          if (_queryFolderURL === op.url) {
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
                return runHook(query, 'afterUpdate', modifiedObjects, _defaultBehavior);
              }
            }
          }
        }

        return false;
      }
      /**
       * Run afterDelete hooks
       *
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runDeleteHooks",
      value: function runDeleteHooks(op) {
        var changed = false;
        var removing = [];
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = this.queries[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var query = _step10.value;

            if (query !== op.query) {
              if (this.runDeleteHook(query, op)) {
                changed = true;

                if (query.expired && query.type === 'object') {
                  removing.push(query);
                  continue;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
              _iterator10["return"]();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        pullObjects(this.queries, removing);
        return changed;
      }
      /**
       * Run a query's afterDelete hook if its URL matches
       *
       * @param  {Object} query
       * @param  {Object} op
       *
       * @return {Boolean}
       */

    }, {
      key: "runDeleteHook",
      value: function runDeleteHook(query, op) {
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
          var _defaultBehavior2 = query.type === 'list' ? 'remove' : 'refresh';

          var _queryFolderURL2 = omitSearchString(query.url);

          if (_queryFolderURL2 === op.url) {
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
                return runHook(query, 'afterDelete', deletedObjects, _defaultBehavior2);
              }
            }
          }
        }

        return false;
      }
      /**
       * Mark matching queries as expired
       *
       * @param  {String|Date} time
       *
       * @return {Boolean}
       */

    }, {
      key: "invalidate",
      value: function invalidate(time) {
        if (time instanceof Date) {
          time = time.toISOString();
        }

        var changed = false;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this.queries[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var query = _step11.value;

            if (!query.expired) {
              if (!time || query.time <= time) {
                query.expired = true;
                changed = true;
              }
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        return this.notifyChanges(changed);
      }
      /**
       * Invalidate an object query
       *
       * @param  {String} url
       * @param  {Object|undefined} options
       *
       * @return {Boolean}
       */

    }, {
      key: "invalidateOne",
      value: function invalidateOne(url, options) {
        var changed = false;
        var absURL = this.resolveURL(url);
        var props = {
          type: 'object',
          url: absURL,
          options: options || {}
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
      }
      /**
       * Invalidate a list query
       *
       * @param  {String} url
       * @param  {Object|undefined} options
       *
       * @return {Boolean}
       */

    }, {
      key: "invalidateList",
      value: function invalidateList(url, options) {
        var changed = false;
        var absURL = this.resolveURL(url);
        var props = {
          type: 'list',
          url: absURL,
          options: options || {}
        };
        var query = this.findQuery(props);

        if (query && !query.expired) {
          query.expired = true;
          changed = true;
        }

        return this.notifyChanges(changed);
      }
      /**
       * Invalidate a page query
       *
       * @param  {String} url
       * @param  {Number} page
       * @param  {Object|undefined} options
       *
       * @return {Boolean}
       */

    }, {
      key: "invalidatePage",
      value: function invalidatePage(url, page, options) {
        var changed = false;
        var absURL = this.resolveURL(url);
        var props = {
          type: 'page',
          url: absURL,
          page: page,
          options: options || {}
        };
        var query = this.findQuery(props);

        if (query && !query.expired) {
          query.expired = true;
          changed = true;
        }

        return this.notifyChanges(changed);
      }
      /**
       * Invalidate multiple object queries
       *
       * @param  {Array<String>} urls
       * @param  {Object|undefined} options
       *
       * @return {Boolean}
       */

    }, {
      key: "invalidateMultiple",
      value: function invalidateMultiple(urls, options) {
        var changed = false;
        var fetchOptions = {};

        for (var name in options) {
          if (name !== 'minimum') {
            fetchOptions[name] = options[name];
          }
        }

        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = urls[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var url = _step12.value;
            var absURL = this.resolveURL(url);
            var props = {
              type: 'object',
              url: absURL,
              options: fetchOptions
            };
            var query = this.findQuery(props);

            if (query && !query.expired) {
              query.expired = true;
              changed = true;
            }
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
              _iterator12["return"]();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }

        return this.notifyChanges(changed);
      }
      /**
       * Return true if a URL is cached, with optional check for expiration
       *
       * @param  {String} url
       * @param  {Boolean|undefined} unexpired
       *
       * @return {Boolean}
       */

    }, {
      key: "isCached",
      value: function isCached(url, unexpired) {
        var absURL = this.resolveURL(url);
        var cached = false;
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = this.queries[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var _query2 = _step13.value;

            if (_query2.url === absURL) {
              if (_query2.object || _query2.objects) {
                if (!unexpired || !_query2.expired) {
                  cached = true;
                  break;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
              _iterator13["return"]();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }

        if (!cached) {
          var folderURL = getFolderURL(absURL);

          if (folderURL) {
            var objectID = parseInt(absURL.substr(folderURL.length));

            if (objectID) {
              var query = this.deriveQuery(absURL);

              if (query) {
                cached = true;
              }
            }
          }
        }

        return cached;
      }
      /**
       * Find an existing query
       *
       * @param  {Object} props
       *
       * @return {Object|undefined}
       */

    }, {
      key: "findQuery",
      value: function findQuery(props) {
        return this.queries.find(function (query) {
          return matchQuery(query, props);
        });
      }
      /**
       * Derive a query for an item from an existing directory query
       *
       * @param  {String} absURL
       * @param  {Boolean|undefined} add
       *
       * @return {Object|undefined}
       */

    }, {
      key: "deriveQuery",
      value: function deriveQuery(absURL, add) {
        var objectFromList;
        var retrievalTime;
        var folderAbsURL = getFolderURL(absURL);
        var objectID = parseInt(absURL.substr(folderAbsURL.length));
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = this.queries[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var _query3 = _step14.value;

            if (!_query3.expired) {
              if (_query3.type === 'page' || _query3.type === 'list') {
                var abbreviated = false;

                if (this.options.abbreviatedFolderContents) {
                  abbreviated = true;
                } else if (_query3.options.abbreviated) {
                  abbreviated = true;
                }

                if (!abbreviated) {
                  if (omitSearchString(_query3.url) === folderAbsURL) {
                    var _iteratorNormalCompletion15 = true;
                    var _didIteratorError15 = false;
                    var _iteratorError15 = undefined;

                    try {
                      for (var _iterator15 = _query3.objects[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                        var object = _step15.value;

                        if (object.url === absURL || object.id === objectID) {
                          objectFromList = object;
                          retrievalTime = _query3.time;
                          break;
                        }
                      }
                    } catch (err) {
                      _didIteratorError15 = true;
                      _iteratorError15 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
                          _iterator15["return"]();
                        }
                      } finally {
                        if (_didIteratorError15) {
                          throw _iteratorError15;
                        }
                      }
                    }

                    if (objectFromList) {
                      break;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
              _iterator14["return"]();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }

        if (objectFromList) {
          var query = {
            type: 'object',
            url: absURL,
            promise: Promise.resolve(objectFromList),
            object: objectFromList,
            time: retrievalTime,
            options: {}
          };

          if (add) {
            this.queries.unshift(query);
          }

          return query;
        }
      }
      /**
       * Return true when there's an authorization token
       *
       * @param  {String|undefined} url
       *
       * @return {Boolean}
       */

    }, {
      key: "isAuthorized",
      value: function isAuthorized(url) {
        var absURL = this.resolveURL(url || '/');
        var token = this.getToken(absURL);
        return !!token;
      }
      /**
       * Return a promise that will be fulfilled with the authorization token
       * when authentication suceeds or null if the request was declined
       *
       * @param  {String} absURL
       *
       * @return {Promise<String>}
       */

    }, {
      key: "requestAuthentication",
      value: function requestAuthentication(absURL) {
        var _this14 = this;

        var promise;
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = this.authentications[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var _authentication = _step16.value;

            if (_authentication.url === absURL) {
              promise = _authentication.promise;
              break;
            }
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
              _iterator16["return"]();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        if (!promise) {
          // add the query prior to triggering the event, since the handler
          // may call authorize()
          var resolve;
          var authentication = {
            url: absURL,
            promise: new Promise(function (f) {
              resolve = f;
            }),
            resolve: resolve
          };
          this.authentications.push(authentication);
          var authenticationEvent = new RelaksDjangoDataSourceEvent('authentication', this, {
            url: absURL
          });
          this.triggerEvent(authenticationEvent);
          promise = authenticationEvent.waitForDecision().then(function () {
            var waitForAuthentication = !authenticationEvent.defaultPrevented;

            if (waitForAuthentication) {
              // wait for authenticate() to get called
              // if authorize() was called, the promise would be resolved already
              return authentication.promise;
            } else {
              // take it back out
              pullObjects(_this14.authentications, [authentication]);
              return null;
            }
          });
        }

        return promise;
      }
      /**
       * Post user credentials to given URL in expectant of a authorization token
       *
       * @param  {String} loginURL
       * @param  {Object} credentials
       * @param  {Array<String>|undefined} allowURLs
       *
       * @return {Promise<Boolean>}
       */

    }, {
      key: "authenticate",
      value: function authenticate(loginURL, credentials, allowURLs) {
        var _this15 = this;

        var loginAbsURL = this.resolveURL(loginURL);
        var allowAbsURLs = this.resolveURLs(allowURLs || ['/']);
        var options = {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(credentials)
        };
        return this.request(loginAbsURL, options, null, false).then(function (response) {
          var token = response ? response.key : null;

          if (!token) {
            throw new RelaksDjangoDataSourceError(403, 'No authorization token');
          }

          return _this15.authorize(token, allowAbsURLs, true);
        });
      }
      /**
       * Accept an authorization token, resolving any pending authentication promises
       *
       * @param  {String} token
       * @param  {Array<String>} allowURLs
       * @param  {Boolean} fresh
       *
       * @return {Promise<Boolean>}
       */

    }, {
      key: "authorize",
      value: function authorize(token, allowURLs, fresh) {
        var _this16 = this;

        var invalid = false;

        if (token) {
          var _iteratorNormalCompletion17 = true;
          var _didIteratorError17 = false;
          var _iteratorError17 = undefined;

          try {
            for (var _iterator17 = this.authorizations[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
              var authorization = _step17.value;

              if (authorization.token === token) {
                if (!authorization.invalid) {
                  invalid = true;
                  break;
                }
              }
            }
          } catch (err) {
            _didIteratorError17 = true;
            _iteratorError17 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
                _iterator17["return"]();
              }
            } finally {
              if (_didIteratorError17) {
                throw _iteratorError17;
              }
            }
          }
        } else {
          invalid = true;
        }

        if (invalid) {
          return Promise.resolve(false);
        }

        var allowAbsURLs = this.resolveURLs(allowURLs || ['/']);
        var authorizationEvent = new RelaksDjangoDataSourceEvent('authorization', this, {
          token: token,
          allowURLs: allowAbsURLs,
          fresh: !!fresh
        });
        this.triggerEvent(authorizationEvent);
        return authorizationEvent.waitForDecision().then(function () {
          var acceptable = !authorizationEvent.defaultPrevented;

          if (!acceptable) {
            return false;
          } // remove previous authorization


          var removing = [];
          var _iteratorNormalCompletion18 = true;
          var _didIteratorError18 = false;
          var _iteratorError18 = undefined;

          try {
            for (var _iterator18 = _this16.authorizations[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
              var _authorization = _step18.value;
              _authorization.allow = _authorization.allow.filter(function (url) {
                return allowAbsURLs.indexOf(url) === -1;
              });

              if (_authorization.allow.length === 0) {
                removing.push(_authorization);
              }
            }
          } catch (err) {
            _didIteratorError18 = true;
            _iteratorError18 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion18 && _iterator18["return"] != null) {
                _iterator18["return"]();
              }
            } finally {
              if (_didIteratorError18) {
                throw _iteratorError18;
              }
            }
          }

          pullObjects(_this16.authorizations, removing); // add new authorization

          var newAuthorization = {
            token: token,
            allow: allowAbsURLs,
            deny: []
          };

          _this16.authorizations.push(newAuthorization); // resolve and remove authentication querys


          var resolved = [];
          var _iteratorNormalCompletion19 = true;
          var _didIteratorError19 = false;
          var _iteratorError19 = undefined;

          try {
            for (var _iterator19 = _this16.authentications[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
              var authentication = _step19.value;

              if (matchAnyURL(authentication.url, allowAbsURLs)) {
                authentication.resolve(token);
                resolved.push(authentication);
              }
            }
          } catch (err) {
            _didIteratorError19 = true;
            _iteratorError19 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion19 && _iterator19["return"] != null) {
                _iterator19["return"]();
              }
            } finally {
              if (_didIteratorError19) {
                throw _iteratorError19;
              }
            }
          }

          pullObjects(_this16.authentications, resolved);
          return _this16.notifyChanges(true);
        });
      }
      /**
       * Cancel authentication, causing outstanding operations that require it to
       * fail (i.e. their promises will be rejected).
       *
       * @param  {Array<String>|undefined} allowURLs
       */

    }, {
      key: "cancelAuthentication",
      value: function cancelAuthentication(allowURLs) {
        var allowAbsURLs = this.resolveURLs(allowURLs || ['/']);
        var canceled = [];
        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = this.authentications[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var authentication = _step20.value;

            if (matchAnyURL(authentication.url, allowAbsURLs)) {
              authentication.resolve(null);
              canceled.push(authentication);
            }
          }
        } catch (err) {
          _didIteratorError20 = true;
          _iteratorError20 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion20 && _iterator20["return"] != null) {
              _iterator20["return"]();
            }
          } finally {
            if (_didIteratorError20) {
              throw _iteratorError20;
            }
          }
        }

        pullObjects(this.authentications, canceled);
      }
      /**
       * Remove authorization for certain URLs or all URLs.
       *
       * @param  {Array<String>|undefined} denyURLs
       */

    }, {
      key: "cancelAuthorization",
      value: function cancelAuthorization(denyURLs) {
        var denyAbsURLs = this.resolveURLs(denyURLs || ['/']);
        var canceled = [];
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = this.authorizations[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var authorization = _step21.value;

            if (!authorization.invalid) {
              authorization.allow = authorization.allow.filter(function (url) {
                return denyURLs.indexOf(url) === -1;
              }); // add to deny list if it's still allowed

              var _iteratorNormalCompletion22 = true;
              var _didIteratorError22 = false;
              var _iteratorError22 = undefined;

              try {
                for (var _iterator22 = denyAbsURLs[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                  var url = _step22.value;

                  if (matchAnyURL(url, authorization.allow)) {
                    authorization.deny.push(url);
                  }
                }
              } catch (err) {
                _didIteratorError22 = true;
                _iteratorError22 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion22 && _iterator22["return"] != null) {
                    _iterator22["return"]();
                  }
                } finally {
                  if (_didIteratorError22) {
                    throw _iteratorError22;
                  }
                }
              }

              if (authorization.allow.length === 0) {
                canceled.push(authorization);
              }
            }
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21["return"] != null) {
              _iterator21["return"]();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }

        pullObjects(this.authorizations, canceled);
      }
      /**
       * Log out from the remote server
       *
       * @param  {String} logoutURL
       * @param  {Array<String>|undefined} denyURLs
       *
       * @return {Promise}
       */

    }, {
      key: "revokeAuthorization",
      value: function revokeAuthorization(logoutURL, denyURLs) {
        var _this17 = this;

        var logoutAbsURL = this.resolveURL(logoutURL);
        var denyAbsURLs = this.resolveURLs(denyURLs || ['/']);
        var token = this.getToken(denyAbsURLs[0]);
        var options = {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache'
        };
        return this.request(logoutAbsURL, options, token, false).then(function () {
          _this17.cancelAuthorization(denyAbsURLs);

          var deauthorizationEvent = new RelaksDjangoDataSourceEvent('deauthorization', _this17, {
            denyURLs: denyAbsURLs
          });

          _this17.triggerEvent(deauthorizationEvent);

          return deauthorizationEvent.waitForDecision().then(function () {
            var clearCachedQueries = !deauthorizationEvent.defaultPrevented;

            if (clearCachedQueries) {
              var denying = [];
              var _iteratorNormalCompletion23 = true;
              var _didIteratorError23 = false;
              var _iteratorError23 = undefined;

              try {
                for (var _iterator23 = _this17.queries[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                  var query = _step23.value;

                  if (matchAnyURL(query.url, denyAbsURLs)) {
                    denying.push(query);
                  }
                }
              } catch (err) {
                _didIteratorError23 = true;
                _iteratorError23 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion23 && _iterator23["return"] != null) {
                    _iterator23["return"]();
                  }
                } finally {
                  if (_didIteratorError23) {
                    throw _iteratorError23;
                  }
                }
              }

              pullObjects(_this17.queries, denying);
            }

            _this17.notifyChanges(true);
          });
        });
      }
      /**
       * Return an authorization token for the given URL
       *
       * @param  {String} url
       *
       * @return {String|undefined}
       */

    }, {
      key: "getToken",
      value: function getToken(url) {
        var _iteratorNormalCompletion24 = true;
        var _didIteratorError24 = false;
        var _iteratorError24 = undefined;

        try {
          for (var _iterator24 = this.authorizations[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
            var authorization = _step24.value;

            if (!authorization.invalid) {
              if (matchAnyURL(url, authorization.allow)) {
                if (!matchAnyURL(url, authorization.deny)) {
                  return authorization.token;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError24 = true;
          _iteratorError24 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion24 && _iterator24["return"] != null) {
              _iterator24["return"]();
            }
          } finally {
            if (_didIteratorError24) {
              throw _iteratorError24;
            }
          }
        }
      }
      /**
       * Mark authorization token as invalid
       *
       * @param  {String} token
       */

    }, {
      key: "invalidateToken",
      value: function invalidateToken(token) {
        if (token) {
          var _iteratorNormalCompletion25 = true;
          var _didIteratorError25 = false;
          var _iteratorError25 = undefined;

          try {
            for (var _iterator25 = this.authorizations[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
              var authorization = _step25.value;

              if (authorization.token === token) {
                authorization.invalid = true;
              }
            }
          } catch (err) {
            _didIteratorError25 = true;
            _iteratorError25 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion25 && _iterator25["return"] != null) {
                _iterator25["return"]();
              }
            } finally {
              if (_didIteratorError25) {
                throw _iteratorError25;
              }
            }
          }
        }
      }
    }, {
      key: "waitForResults",
      value: function waitForResults(inputs) {
        var _this18 = this;

        var results = [];
        var errors = [];
        var promises = [];
        var error = null;
        var _iteratorNormalCompletion26 = true;
        var _didIteratorError26 = false;
        var _iteratorError26 = undefined;

        try {
          var _loop = function _loop() {
            var _step26$value = _slicedToArray(_step26.value, 2),
                index = _step26$value[0],
                input = _step26$value[1];

            if (input.then instanceof Function) {
              var promise = input.then(function (result) {
                results[index] = result;
                errors[index] = null;
              }, function (err) {
                results[index] = null;
                errors[index] = err;

                if (!error) {
                  error = err;
                }
              });
              promises.push(promise);
            } else {
              results[index] = input;
              errors[index] = null;
            }
          };

          for (var _iterator26 = inputs.entries()[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError26 = true;
          _iteratorError26 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion26 && _iterator26["return"] != null) {
              _iterator26["return"]();
            }
          } finally {
            if (_didIteratorError26) {
              throw _iteratorError26;
            }
          }
        }

        this.stopExpirationCheck();
        return Promise.all(promises).then(function () {
          _this18.startExpirationCheck();

          if (error) {
            error.results = results;
            error.errors = errors;
          }

          return {
            results: results,
            errors: errors,
            error: error
          };
        });
      }
      /**
       * Start expiration checking
       */

    }, {
      key: "startExpirationCheck",
      value: function startExpirationCheck() {
        var _this19 = this;

        var refreshInterval = this.options.refreshInterval;

        if (refreshInterval > 0) {
          if (!this.expirationCheckInterval) {
            this.expirationCheckInterval = setInterval(function () {
              _this19.checkExpiration();
            }, Math.min(100, refreshInterval / 10));
          }
        }
      }
      /**
       * Stop expiration checking
       */

    }, {
      key: "stopExpirationCheck",
      value: function stopExpirationCheck() {
        if (this.expirationCheckInterval) {
          clearInterval(this.expirationCheckInterval);
          this.expirationCheckInterval = 0;
        }
      }
      /**
       * Mark queries as expired and trigger onChange event when enough time has passed
       */

    }, {
      key: "checkExpiration",
      value: function checkExpiration() {
        var interval = Number(this.options.refreshInterval);

        if (interval) {
          var time = getTime(-interval);
          this.invalidate(time);
        }
      }
      /**
       * Perform an HTTP GET operation
       *
       * @param  {String} url
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "get",
      value: function get(url) {
        var token = this.getToken(url);
        var options = {
          method: 'GET'
        };
        return this.request(url, options, token, true);
      }
      /**
       * Perform an HTTP POST operation
       *
       * @param  {String} url
       * @param  {Object} object
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "post",
      value: function post(url, object) {
        var token = this.getToken(url);
        var options = {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(object)
        };
        return this.request(url, options, token, true);
      }
      /**
       * Perform an HTTP PUT operation
       *
       * @param  {String} url
       * @param  {Object} object
       *
       * @return {Promise<Object>}
       */

    }, {
      key: "put",
      value: function put(url, object) {
        var token = this.getToken(url);
        var options = {
          method: 'PUT',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(object)
        };
        return this.request(url, options, token, true);
      }
      /**
       * Perform an HTTP DELETE operation
       *
       * @param  {String} url
       *
       * @return {Promise<null>}
       */

    }, {
      key: "delete",
      value: function _delete(url) {
        var token = this.getToken(url);
        var options = {
          method: 'DELETE',
          mode: 'cors',
          cache: 'no-cache'
        };
        return this.request(url, options, token, true);
      }
      /**
       * Perform an HTTP request
       *
       * @param  {String} url
       * @param  {Object} options
       * @param  {String|null} token
       * @param  {Boolean} waitForAuthentication
       *
       * @return {Promise}
       */

    }, {
      key: "request",
      value: function request(url, options, token, waitForAuthentication) {
        var _this20 = this;

        if (token) {
          var authorizationKeyword = this.options.authorizationKeyword;

          if (!options) {
            options = {};
          }

          if (!options.headers) {
            options.headers = {};
          }

          options.headers['Authorization'] = authorizationKeyword + ' ' + token;
        }

        return this.fetch(url, options).then(function (response) {
          var status = response.status,
              statusText = response.statusText;

          if (status < 400) {
            if (status == 204) {
              return null;
            }

            return response.json();
          } else {
            if (status === 401 || status === 403) {
              _this20.invalidateToken(token);
            }

            if (status === 401 && waitForAuthentication) {
              return _this20.requestAuthentication(url).then(function (newToken) {
                if (newToken) {
                  return _this20.request(url, options, newToken, true);
                } else {
                  throw new RelaksDjangoDataSourceError(status, statusText);
                }
              });
            } else {
              throw new RelaksDjangoDataSourceError(status, statusText);
            }
          }
        });
      }
      /**
       * Wait for active to become true then run fetch()
       *
       * @type {Promise<Response>}
       */

    }, {
      key: "fetch",
      value: function (_fetch) {
        function fetch(_x, _x2) {
          return _fetch.apply(this, arguments);
        }

        fetch.toString = function () {
          return _fetch.toString();
        };

        return fetch;
      }(function (url, options) {
        var _this21 = this;

        return this.waitForActivation().then(function () {
          var fetchFunc = _this21.options.fetchFunc;

          if (!fetchFunc) {
            fetchFunc = fetch;
          }

          return fetchFunc(url, options)["catch"](function (err) {
            // try again if the data source was deactivated in the middle of
            // an operation
            if (!_this21.active) {
              return _this21.fetch(url, options);
            } else {
              throw err;
            }
          });
        });
      })
      /**
       * If this.active is false, wait for it to become true
       *
       * @return {Promise}
       */

    }, {
      key: "waitForActivation",
      value: function waitForActivation() {
        if (this.active) {
          return Promise.resolve();
        }

        if (!this.activationPromise) {
          var resolve, reject;
          this.activationPromise = new Promise(function (f1, f2) {
            resolve = f1;
            reject = f2;
          });
          this.activationPromise.resolve = resolve;
          this.activationPromise.reject = reject;

          if (process.env.NODE_ENV !== 'production') {
            console.log('Waiting for activate() to be called...');
          }
        }

        return this.activationPromise;
      }
    }]);

    return RelaksDjangoDataSource;
  }(RelaksEventEmitter);
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
    var hookFunc = query.options ? query.options[hookName] : null;

    if (!hookFunc) {
      hookFunc = defaultBehavior;
    }

    if (typeof hookFunc === 'string') {
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
        query.object = impact;
        query.promise = Promise.resolve(impact);
      } else {
        query.expired = true;
      }

      return true;
    } else if (query.type === 'page' || query.type === 'list') {
      var _impact = true;

      if (query.objects && input.every(Boolean)) {
        // sort list by ID or URL
        sortObjects(input);

        try {
          _impact = hookFunc(query.objects, input);
        } catch (err) {
          console.error(err);
        }
      }

      if (_impact === false) {
        return false;
      }

      if (_impact instanceof Array) {
        var objects = _impact;

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
    var newList = [];
    var _iteratorNormalCompletion27 = true;
    var _didIteratorError27 = false;
    var _iteratorError27 = undefined;

    try {
      for (var _iterator27 = objects[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
        var object = _step27.value;
        var newObject = findObject(newObjects, object);

        if (newObject) {
          if (!matchObject(newObject, object)) {
            changed = true;
            newList.push(newObject);
            continue;
          }
        }

        newList.push(object);
      }
    } catch (err) {
      _didIteratorError27 = true;
      _iteratorError27 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion27 && _iterator27["return"] != null) {
          _iterator27["return"]();
        }
      } finally {
        if (_didIteratorError27) {
          throw _iteratorError27;
        }
      }
    }

    return changed ? newList : false;
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
    var _iteratorNormalCompletion28 = true;
    var _didIteratorError28 = false;
    var _iteratorError28 = undefined;

    try {
      for (var _iterator28 = newObjects[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
        var object = _step28.value;
        newList.unshift(object);
      }
    } catch (err) {
      _didIteratorError28 = true;
      _iteratorError28 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion28 && _iterator28["return"] != null) {
          _iterator28["return"]();
        }
      } finally {
        if (_didIteratorError28) {
          throw _iteratorError28;
        }
      }
    }

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
    var _iteratorNormalCompletion29 = true;
    var _didIteratorError29 = false;
    var _iteratorError29 = undefined;

    try {
      for (var _iterator29 = newObjects[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
        var object = _step29.value;
        newList.push(object);
      }
    } catch (err) {
      _didIteratorError29 = true;
      _iteratorError29 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion29 && _iterator29["return"] != null) {
          _iterator29["return"]();
        }
      } finally {
        if (_didIteratorError29) {
          throw _iteratorError29;
        }
      }
    }

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
    var newList = [];
    var _iteratorNormalCompletion30 = true;
    var _didIteratorError30 = false;
    var _iteratorError30 = undefined;

    try {
      for (var _iterator30 = objects[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
        var object = _step30.value;

        if (findObjectIndex(deletedObjects, object) === -1) {
          newList.push(object);
        } else {
          changed = true;
        }
      }
    } catch (err) {
      _didIteratorError30 = true;
      _iteratorError30 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion30 && _iterator30["return"] != null) {
          _iterator30["return"]();
        }
      } finally {
        if (_didIteratorError30) {
          throw _iteratorError30;
        }
      }
    }

    return changed ? newList : false;
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

          for (var _name in object2) {
            if (!(_name in object1)) {
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
    var sep = qi === -1 ? '?' : '&';
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
    return otherURLs.some(function (otherURL) {
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
          // allow object to have fewer properties than those in the list
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
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = objects[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var object = _step31.value;
          var objectFound = findObject(list, object, different);

          if (objectFound) {
            found.push(objectFound);
          }
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31["return"] != null) {
            _iterator31["return"]();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }

      if (found.length > 0) {
        return found;
      }
    }
  }

  function excludeObjects(list, objects) {
    var newList = list.slice();
    pullObjects(newList, objects);

    if (newList.length > 0) {
      return newList;
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
    if (src instanceof Array) {
      return src.map(function (obj) {
        return cloneObject(obj);
      });
    } else if (src instanceof Object) {
      var dst = {};

      for (var name in src) {
        dst[name] = cloneObject(src[name]);
      }

      return dst;
    } else {
      return src;
    }
  }
  /**
   * Sort a list of objects based on ID or URL
   *
   * @param  {Array<Object>} list
   */


  function sortObjects(list) {
    list.sort(function (a, b) {
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
   * Append objects to a list, removing any duplicates first
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
      var duplicates = [];
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = objects[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var object = _step32.value;

          if (findObjectIndex(list, object) !== -1) {
            duplicates.push(object);
          }
        }
      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32["return"] != null) {
            _iterator32["return"]();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }

      pullObjects(list, duplicates);
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
    } // don't add objects ahead of the intersection from the old list or
    // objects that are present in the new list (due to change in order)


    var oldObjects = [];
    var _iteratorNormalCompletion33 = true;
    var _didIteratorError33 = false;
    var _iteratorError33 = undefined;

    try {
      for (var _iterator33 = oldList[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
        var _step33$value = _slicedToArray(_step33.value, 2),
            index = _step33$value[0],
            object = _step33$value[1];

        if (index >= startIndex) {
          if (findObjectIndex(newList, object) === -1) {
            oldObjects.push(object);
          }
        }
      }
    } catch (err) {
      _didIteratorError33 = true;
      _iteratorError33 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion33 && _iterator33["return"] != null) {
          _iterator33["return"]();
        }
      } finally {
        if (_didIteratorError33) {
          throw _iteratorError33;
        }
      }
    }

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
      }

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
    var minimum = options ? options.minimum : undefined;

    if (typeof minimum === 'string') {
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
    var date = new Date();

    if (delta) {
      date = new Date(date.getTime() + delta);
    }

    return date.toISOString();
  }

  function pullObjects(list, objects) {
    if (objects instanceof Array) {
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = objects[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          var object = _step34.value;
          var index = list.indexOf(object);

          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34["return"] != null) {
            _iterator34["return"]();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }
    }
  }

  var RelaksDjangoDataSourceProxy =
  /*#__PURE__*/
  function () {
    function RelaksDjangoDataSourceProxy(dataSource) {
      _classCallCheck(this, RelaksDjangoDataSourceProxy);

      this.dataSource = dataSource;
    }

    _createClass(RelaksDjangoDataSourceProxy, [{
      key: "fetchOne",
      value: function fetchOne(url, options) {
        return this.dataSource.fetchOne(url, options);
      }
    }, {
      key: "fetchList",
      value: function fetchList(url, options) {
        return this.dataSource.fetchList(url, options);
      }
    }, {
      key: "fetchMultiple",
      value: function fetchMultiple(urls, options) {
        return this.dataSource.fetchMultiple(urls, options);
      }
    }, {
      key: "fetchPage",
      value: function fetchPage(url, page, options) {
        return this.dataSource.fetchPage(url, page, options);
      }
    }, {
      key: "insertOne",
      value: function insertOne(folderURL, object) {
        return this.dataSource.insertOne(folderURL, object);
      }
    }, {
      key: "insertMultiple",
      value: function insertMultiple(folderURL, objects) {
        return this.dataSource.insertMultiple(folderURL, objects);
      }
    }, {
      key: "updateOne",
      value: function updateOne(folderURL, object) {
        return this.dataSource.updateOne(folderURL, object);
      }
    }, {
      key: "updateMultiple",
      value: function updateMultiple(folderURL, objects) {
        return this.dataSource.updateMultiple(folderURL, objects);
      }
    }, {
      key: "deleteOne",
      value: function deleteOne(folderURL, object) {
        return this.dataSource.deleteOne(folderURL, object);
      }
    }, {
      key: "deleteMultiple",
      value: function deleteMultiple(folderURL, objects) {
        return this.dataSource.deleteMultiple(folderURL, objects);
      }
    }, {
      key: "authenticate",
      value: function authenticate(url, credentials) {
        return this.dataSource.authenticate(url, credentials);
      }
    }, {
      key: "cancelAuthentication",
      value: function cancelAuthentication(url) {
        return this.dataSource.cancelAuthentication(url);
      }
    }]);

    return RelaksDjangoDataSourceProxy;
  }();

  exports.DataSource = RelaksDjangoDataSource;
  exports.DataSourceError = RelaksDjangoDataSourceError;
  exports.DataSourceEvent = RelaksDjangoDataSourceEvent;
  exports.DataSourceProxy = RelaksDjangoDataSourceProxy;
  exports.RelaksDjangoDataSource = RelaksDjangoDataSource;
  exports.RelaksDjangoDataSourceError = RelaksDjangoDataSourceError;
  exports.RelaksDjangoDataSourceEvent = RelaksDjangoDataSourceEvent;
  exports.RelaksDjangoDataSourceProxy = RelaksDjangoDataSourceProxy;
  exports.default = RelaksDjangoDataSource;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
