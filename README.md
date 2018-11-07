Relaks Django Data Source
-------------------------
This module lets you access a Django server from a React app that uses [Relaks](https://github.com/chung-leong/relaks). It's designed to work with [Django REST framework](https://www.django-rest-framework.org/).

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Methods](#methods)
* [Hooks](#hooks)
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

The base URL of the remote server. It'll be added to any URL that isn't absolute.

### refreshInterval

The amount of time, in milliseconds, to wait before rerunning data queries to ensure freshness. The data source caches all queries. When a query matches one that was performed before, the results obtained earlier will be returned immediately. If the amount of time elapsed since exceeds `refreshInterval`, the data source will rerun the query. If the results differ in anyway, a `change` event will occur.

You can always manually flag queries as out-of-date by calling [invalidate](#invalidate).

### authorizationKeyword

The keyword that precedes the token in the HTTP Authorization header:

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

The default matches what Django REST Framework's [TokenAuthentication scheme](https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication) uses. There's no need to supply this unless you have subclassed `TokenAuthentication` and changed the keyword to something else.

### abbreviatedFolderContents

Indicate that objects in directory listings are always different from those retrieved individually. For example, when you ask for `/articles/5/`, the data source will normally check to see if the object can be found in an existing query for `/articles/`. This behavior would lead to erroneous results if objects in a directory listing only contains a subset of their properties. Setting `abbreviatedFolderContents` to `true` disables it completely.

You can also flag queries as abbreviated selectively.

## Methods

### addEventListener

```typescript
function addEventListener(name: string, handler: function, beginning?:boolean): void
```

Add an event listener to the route manager. `handler` will be called whenever events of `type` occur. When `beginning` is true, the listener will be place before any existing listeners. Otherwise it's added at the end of the list.

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### removeEventListener

```typescript
function removeEventListener(name: string, handler: function): void
```

Remove an event listener from the route manager. `handler` and `type` must match what was given to [addEventListener](#addeventlistener)().

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### fetchOne

```typescript
async function fetchOne(url: string, options?: object): object
```

Fetch an object from the server. Operations are cached. If the URL matches that of a previous call, this method will return the same promise as before (which may or may not be fulfilled already). It will also check the results of calls to [fetchPage()](#fetchpage) and [fetchList()](#fetchlist) to see if the object in question hasn't been already retrieved.

#### Options

#### afterUpdate

See [afterUpdate](#afterupdate). The default is ['replace'](#replace).

#### afterDelete

See [afterDelete](#afterdelete). The default is ['remove'](#remove).

### fetchPage

```typescript
async function fetchPage(url: string, page: number, options?: object): object[]
```

Fetch a single page of results from a directory listing. All results will be returned if the server doesn't support pagination.

### Options

##### abbreviated

Indicates that the objects found at `url` are abbreviated, with certain properties omitted to reduce transfer time. The data source should not fulfill calls to `fetchOne()` with them.

#### afterInsert

See [afterInsert](#afterinsert). The default is ['refresh'](#refresh).

#### afterUpdate

See [afterUpdate](#afterupdate). The default is ['refresh'](#refresh).

#### afterDelete

See [afterDelete](#afterdelete). The default is ['refresh'](#refresh).

### fetchList

```typescript
async function fetchList(url: string, options?: object): object[]
```

Conceptually, fetch all objects in a directory. In actuality, the method will only return the first page of results initially (when pagination is enabled). Attached to the returned array will be the method `more()`. When it's called, an additional page will be fetched and appended to the list.

This method is designed for handling large result sets with continuous scrolling (as opposed to traditional pagination).

In addition to `more()`, the returned array will also have the property `total`. It's the number of objects in the directory on the server. The standard property `length` gives the number of objects retrieved.

`more` and `total` are always present, even when pagination is not available. Calls to `more()` does nothing when there are no more pages to retrieve.

#### Options

##### minimum

By default, `fetchList()` will return as soon as it has any data. Specifying `minimum` forces it to wait until a certain number of objects have become available.

When `minimum` is a negative number, that's interpreted as the difference from the total.

When `minimum` is a string, it's expected to hold a percentage. For example, `100%` means grabbing everything.

##### abbreviated

Indicates that the objects found at `url` are abbreviated, with certain properties omitted to reduce transfer time. The data source should not fulfill calls to `fetchOne()` with them.

#### afterInsert

See [afterInsert](#afterinsert). The default is ['refresh'](#refresh).

#### afterUpdate

See [afterUpdate](#afterupdate). The default is ['refresh'](#refresh).

#### afterDelete

See [afterDelete](#afterdelete). The default is ['remove'](#remove).

### fetchMultiple

```typescript
async function fetchMultiple(url: string, options?: object): object[]
```

Fetch multiple objects in a single call. It's convenience method designed for handling one-to-many relations.

### Options

#### minimum

By default, the promise returned by `fetchMultiple()` is not fulfilled until every object is retrieved from the remote server. When `minimum` is specified, the promise will fulfill immediately when the number of cached objects meets the requirement. `null` will appear in place of an object in the array when it's uncached. When the uncached objects finally arrive, the data source emits a `change` event. Subsequent calls to `fetchMultiple()` will then return all requested objects.

### invalidate

```typescript
function invalidate(props: object): boolean
```

Flag matching data queries as out-of-date. `props` may contain two properties: `url` and `time`. `url` can be either an absolute URL or an relative URL. It let you to invalidate a specific object or all objects in a directory. For example, `/articles/` would match `/articles/5/`, `/articles/6/` as well as queries on `/articles/`. Meanwhile, `/articles/5/` would match a query for the object itself and any query on `/articles/` that happens to have that object. `time` can be used to invalidate objects retrieved prior to a given time. It should be a `Date` object or an ISO timestamp. Queries

### insertOne

```typescript
async function insertOne(folderURL: string, object: object): object
```

Insert an object into a directory on the remote server.

### insertMultiple

```typescript
async function  insertMultiple(folderURL: string, objects: object[]): object[]
```

Insert multiple objects into a directory on the remote server.

### updateOne

```typescript
async function updateOne(folderURL: string, object: object): object
```

```typescript
async function updateOne(object: object): object
```

Update an object on the remote server.

When URL keys are used, `folderURL` can be omitted (since the object contains its own URL).

### updateMultiple

```typescript
function updateMultiple(folderURL: string, objects: object[]): object[]
```

```typescript
function updateMultiple(objects: object[]): object[]
```

Update multiple objects on the remote server.

When URL keys are used, `folderURL` can be omitted (since the objects contain their own URLs).

### deleteOne

```typescript
async function deleteOne(folderURL: string, object: object): object
```

```typescript
async function deleteOne(object: object): object
```

Delete an object on the remote server.

When URL keys are used, `folderURL` can be omitted (since the object contains its own URL).

### deleteMultiple

```typescript
function deleteMultiple(folderURL: string, objects: object[]): object[]
```

```typescript
function deleteMultiple(objects: object[]): object[]
```

Delete multiple objects on the remote server.

When URL keys are used, `folderURL` can be omitted (since the objects contain their own URLs).

### authenticate

```typescript
async function authenticate(loginURL: string, credentials: object, allowURLs?: string[]): boolean
```

### authorize

```typescript
async function authorize(loginURL: string, token: string, allowURLs?: string[], fresh?: boolean): boolean
```

### cancelAuthentication

```typescript
function cancelAuthentication(allowURLs: string[]): void
```

### cancelAuthorization

```typescript
function cancelAuthorization(denyURLs: string[]): void
```

### revokeAuthorization

```typescript
function revokeAuthorization(logoutURL): void
```

### get

```typescript
async function get(url: string): object
```

Low-level function that performs an HTTP GET operation.

### post

```typescript
async function post(url: string, object: object): object
```

Low-level function that performs an HTTP POST operation.

### put

```typescript
async function put(url: string, object: object): object
```

Low-level function that performs an HTTP PUT operation.

### delete

```typescript
async function delete(url: string): null
```

Low-level function that performs an HTTP DELETE operation.

## Hooks

### afterInsert

A query's `afterInsert` hook is invoked after new objects have been inserted into a directory using `insertOne()` or `insertMultiple()` so that cached results can be updated. Only queries performed through `fetchPage()` or `fetchList()` have this hook.

The hook function has the following form:

```typescript
function afterInserHook(objects: object[], newObjects: object[]): objects[]
```

`objects` are the existing cached objects, while `newObjects` is a list of newly created objects. The function should return a new array, with the new objects added. If there's no change (because none of the new objects actually matches the query), the function should return `false`. If the function return `true`, the query will be invalidated.

A string can be used to specify a predefined hook function. The possible values are ["refresh"](#refresh), ["ignore"](#ignore), ["unshift"](#unshift), ["push"](#push).

### afterUpdate

A query's `afterUpdate` hook is invoked after existing objects have been modified using `updateOne()` or `updateMultiple()` so that cached results can be updated.

For queries performed through `fetchOne()`, the hook function has the following form:

```typescript
function afterUpdateHook(object: object, newObject: object): object
```

`object` is the cached object before, while `newObject` is the object returned by the server after the save operation. If the function returns an object, then that becomes the cached object. If it returns `false`, that means no change occurred. If it returns `true`, the query is invalidated.

For queries performed through `fetchPage()` or `fetchList`, the hook function has the following form:

```typescript
function afterUpdateHook(objects: object[], newObjects: object[]): object[]
```

`objects` are the existing cached objects, while `newObjects` is a list of modified objects. The function should return a new array with the modified objects incorporated. Care must be taken to ensure correct sort order. If there's no change, the function should return `false`. If the function return `true`, the query will be invalidated.

A string can be used to specify a predefined hook function. The possible values are ["refresh"](#refresh), "ignore", "replace".

### afterDelete

A query's `afterDelete` hook is invoked after objects have been deleted using `deleteOne()` or `deleteMultiple()` so that cached results can be updated.

For queries performed through `fetchOne()`, the hook function has the following form:

```typescript
function afterDeleteHook(object: object, deletedObject: object): object
```

`object` is the cached object before, while `deletedObject` is just a copy of the same object. If the function returns an object, that'll be the result when the query is run again. If it returns `true`, then the query is removed from the cache.

For queries performed through `fetchPage()` or `fetchList`, the hook function has the following form:

```typescript
function afterUpdateHook(objects: objects[], newObjects: objects[]): objects[]
```

`objects` are the existing cached objects, while `newObjects` is a list of deleted objects. The function should return a new array with the deleted objects removed. If there's no change, it should return `false`. If it returns `true`, the query will be refreshed.

A string can be used to specify a predefined hook function. The possible values are "refresh", "ignore", "remove".

## Predefined hook functions

* "refresh" - returns true to request refreshing of the query
* "ignore" - returns false to indicate there's no need to change the cached results
* "replace" - replaces currently cached objects with the updated copy from the server
* "unshift" - places new objects at the beginning of the list
* "push" - places new objects at the end of the list
* "remove" - remove deleted objects from the list

## Events

### change

A `change` event is emitted whenever rerunning queries might yield new result sets.

#### Properties

* `type` - 'change'
* `target` - the data source
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was called

#### Methods

### authorization

* `postponeDefault(promise: Promise)` - postpones the route change util `promise` is fulfilled
* `stopImmediatePropagation()` - stops other listeners from receiving the event

### authentication

An `authentication` is emitted when the server responds to a request with the HTTP status 401 ("Unauthorized").

#### Default behavior

Wait for authentication to occur then try again.

#### Properties

* `type` - 'authentication'
* `target` - the data source
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was called
* `url` - the URL that triggered the 401 response

#### Methods

* `preventDefault()` - fail the operation that trigger the authentication request
* `postponeDefault(promise: Promise)` - wait for given promise to be fulfilled and fail the operation is the fulfillment value is false
* `stopImmediatePropagation()` - stops other listeners from receiving the event

### authorization

The `authorization` event is emitted when the data source receives an authorization token, either from the server after a call to `authenticate()` or from your app via `authorize()`.

#### Default behavior

Allow operations waiting for authentication to proceed.

#### Properties

* `type` - 'authorization'
* `target` - the data source
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was
* `url` - the login URL used
* `token` - the authorization token
* `fresh` - whether the token was freshly issued by the server

#### Methods

* `preventDefault()` - pending operations from proceeding despite authorization having been granted
* `postponeDefault(promise: Promise)` - postpones the decision on whether to proceed until the given promise is fulfilled
* `stopImmediatePropagation()` - stops other listeners from receiving the event

Generally, there's no reason to prevent the default behavior from happen. Do so might only make sense if the app fails to gain some other authorization.

## Examples

* [Starwars API: Episode V](https://github.com/chung-leong/relaks-starwars-example-sequel) - sequel to the first Starwars API example
* [Starwars API: Episode VI - The Server Strikes Back](https://github.com/chung-leong/relaks-starwars-example-isomorphic) - demonstrates how to create an isomorphic app
* [Django todo list](https://github.com/chung-leong/relaks-django-todo-example) - demonstrates authentication and data saving using [relaks-django-data-source](https://github.com/chung-leong/relaks-django-data-source)

## License

This project is licensed under the MIT License - see the [LICENSE](#LICENSE) file for details
