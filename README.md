Relaks Django Data Source
-------------------------
This module lets you access a Django server from a React app that uses
[Relaks](https://github.com/chung-leong/relaks). It's designed to work with
[Django REST framework](https://www.django-rest-framework.org/).

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Methods](#methods)
* [Events](#events)
* [Examples](#examples)

## Installation

```sh
npm --save-dev install relaks-django-data-source
```

## Usage

```javascript
import DjangoDataSource from 'relaks-django-data-source';

let options = {
    baseURL: 'https://swapi.co/api',
    refreshInterval: 60 * 1000,
    authorizationKeyword: 'Token',
    abbreviatedFolderContents: false,
};
let dataSource = new DjangoDataSource(options);
dataSource.activate();
dataSource.addEventListener('change', handleDataChange);

```

## Options

### baseURL

The base URL of the remote server. It'll be added to any URL that isn't
absolute.

### refreshInterval

The amount of time, in milliseconds, to wait before rerunning data queries to
ensure freshness. The data source caches all queries. When a query matches one
that was performed before, the results obtained earlier will be returned
immediately. If the amount of time elapsed since exceeds `refreshInterval`,
the data source will rerun the query. If the results differ in anyway, a
`change` event will occur.

You can always manually flag queries as out-of-date by calling
[invalidate](#invalidate).

### authorizationKeyword

The keyword that precedes the token in the HTTP Authorization header:

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

The default matches what Django REST Framework's
[TokenAuthentication scheme](https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication)
uses. There's no need to supply this unless you have subclassed
`TokenAuthentication` and changed the keyword to something else.

### abbreviatedFolderContents

Indicate that objects in directory listings are always different from those
retrieved individually. For example, when you ask for `/articles/5/`, the data
source will normally check to see if the object can be found in an existing
query for `/articles/`. This behavior would lead to erroneous results if
objects in a directory listing only contains a subset of their properties.
Setting `abbreviatedFolderContents` to `true` disables it completely.

You can also flag queries as abbreviated selectively.

## Methods

### addEventListener

```javascript
/**
 * @param  {String} type
 * @param  {Function} handler
 * @param  {Boolean|undefined} beginning
 */
addEventListener(type, handler, beginning)
```
Add an event listener to the route manager. `handler` will be called whenever
events of `type` occur. When `beginning` is true, the listener will be place
before any existing listeners. Otherwise it's added at the end of the list.

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### removeEventListener

```javascript
/**
 * @param  {String} type
 * @param  {Function} handler
 */
removeEventListener(type, handler)
```
Remove an event listener from the route manager. `handler` and `type` must
match what was given to [addEventListener](#addeventlistener)().

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### fetchOne

```javascript
/**
 * @param  {String} url
 * @param  {Object|undefined} options
 *
 * @return {Promise<Object>}
 */
fetchOne(url, options)
```

### fetchPage

```javascript
/**
 * @param  {String} url
 * @param  {Number} page
 * @param  {Object|undefined} options
 *
 * @return {Promise<Array>}
 */
fetchPage(url, page, options)
```

### fetchList

```javascript
/**
 * @param  {String} url
 * @param  {Object} options
 *
 * @return {Promise<Array>}
 */
fetchList(url, options)
```

### fetchMultiple

```javascript
/**
 * @param  {Array<String>} urls
 * @param  {Object} options
 *
 * @return {Promise<Array>}
 */
fetchMultiple(urls, options)
```

### invalidate

```javascript
/**
 * @param  {Object} props
 *
 * @return {Boolean}
 */
invalidate(props)
```

### insertOne

```javascript
/**
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
insertOne(folderURL, object)
```

### insertMultiple

```javascript
/**
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
insertMultiple(folderURL, objects)
```

### updateOne

```javascript
/**
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
updateOne(folderURL, object)
```

### updateMultiple

```javascript
/**
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
updateMultiple(folderURL, objects)
```

### deleteOne

```javascript
/**
 * @param  {String} folderURL
 * @param  {Object} object
 *
 * @return {Promise<Object>}
 */
deleteOne(folderURL, object)
```

### deleteMultiple

```javascript
/**
 * @param  {String} folderURL
 * @param  {Array<Object>} objects
 *
 * @return {Promise<Array>}
 */
deleteMultiple(folderURL, objects)
```

### authenticate

```javascript
/**
 * @param  {String} loginURL
 * @param  {Object} credentials
 * @param  {Array<String>} allowURLs
 *
 * @return {Promise<Boolean>}
 */
authenticate = function(loginURL, credentials, allowURLs)
```

### authorize

```javascript
/**
 * @param  {String} loginURL
 * @param  {String} token
 * @param  {Array<String>} allowURLs
 *
 * @return {Promise<Boolean>}
 */
authorize(loginURL, token, allowURLs)
```

### cancelAuthentication

### cancelAuthorization

### revokeAuthorization

### get

### post

### put

### delete

## Events

### change

### authentication

### authorization

## Examples
