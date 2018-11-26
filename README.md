Relaks Django Data Source
-------------------------
This module lets you access a Django server from a React app that use [Relaks](https://github.com/chung-leong/relaks). It's designed to work with the [Django REST framework](https://www.django-rest-framework.org/).

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
    abbreviatedFolderContents: false,
    authorizationKeyword: 'Token',
    baseURL: 'https://swapi.co/api',
    refreshInterval: 60 * 1000,
};
let dataSource = new DjangoDataSource(options);
dataSource.activate();
```

```javascript
/* Root-level React component */
class Application extends PureComponent {
    constructor(props) {
        super(props);
        let { dataSource } = props;
        this.state = {
            database: new Database(dataSource);
        }
    }

    componentDidMount() {
        let { dataSource } = this.props;
        dataSource.addEventListener('change', this.handleDataSourceChange);
    }

    /* ... */

    handleDataSourceChange = (evt) => {
        let { dataSource } = this.props;
        let database = new Database(dataSource);
        this.setState({ database });
    }
}
```

Components are expected to access functionalities of the data source through a proxy object--`Database` in the sample code above. See the documentation of Relaks for an [explanation](https://github.com/chung-leong/relaks#proxy-objects). A [default implementation](https://github.com/chung-leong/relaks-django-data-source/blob/master/proxy.js) is provided for reference purpose. It's recommended that you create your own.

## Options

* [abbreviatedFolderContents](#abbreviatedfoldercontents)
* [authorizationKeyword](#authorizationkeyword)
* [baseURL](#baseurl)
* [refreshInterval](#refreshinterval)

### abbreviatedFolderContents

A boolean value indicating whether objects in directory listings are always different from those fetched individually. Normally, when you ask for a single object, the data source will check to see if the object can be found in a cached directory query. For example, it'll check queries on `/articles/` when you request `/articles/5/`. This behavior would lead to erroneous results if objects in a directory listing only contains a subset of their properties. Setting `abbreviatedFolderContents` to `true` disables it completely.

You can also flag queries as abbreviated selectively.

The default value is `false`.

### authorizationKeyword

The keyword that precedes the token in the HTTP Authorization header:

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

The default matches what the Django REST Framework's [TokenAuthentication scheme](https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication) uses. You don't need to supply this unless you have subclassed `TokenAuthentication` and changed the keyword to something else.

### baseURL

The base URL of the remote server. It'll be added to any URL that isn't absolute.

### refreshInterval

The amount of time, in milliseconds, to wait before rerunning data queries to ensure freshness. The data source caches all queries. When a query matches one that was performed before, the results obtained earlier will be returned immediately. If the amount of time elapsed since exceeds `refreshInterval`, the data source will rerun the query. If the results differ in anyway, a `change` event will occur.

You can also manually flag queries as out-of-date by calling [invalidate()](#invalidate).

## Methods

**Event listeners:**

* [addEventListener()](#addeventlistener)
* [removeEventListener()](#removeeventlistener)

**Activation**

* [activate()](#activate)
* [deactivate()](#deactivate)

**Data retrieval:**

* [fetchList()](#fetchlist)
* [fetchMultiple()](#fetchmultiple)
* [fetchOne()](#fetchone)
* [fetchPage()](#fetchpage)

**Cache invalidation:**

* [invalidate()](#invalidate)
* [invalidateList()](#invalidatelist)
* [invalidateMultiple()](#invalidatemultiple)
* [invalidateOne()](#invalidateone)
* [invalidatePage()](#invalidatepage)

**Data modification:**

* [deleteOne()](#deleteone)
* [deleteMultiple()](#deletemultiple)
* [insertOne()](#insertone)
* [insertMultiple()](#insertmultiple)
* [updateOne](#updateone)
* [updateMultiple()](#updatemultiple)

**Access control:**

* [authenticate()](#authenticate)
* [authorize()](#authorize)
* [cancelAuthentication()](#cancelauthentication)
* [cancelAuthorization()](#cancelauthorization)
* [isAuthorized()](#isauthorized)
* [revokeAuthorization()](#revokeauthorization)

**HTTP request:**

* [delete()](#delete)
* [get()](#get)
* [post()](#post)
* [put()](#put)

### addEventListener

```typescript
function addEventListener(name: string, handler: function, beginning?:boolean): void
```

Attach an event listener to the data source. `handler` will be called whenever events of `type` occur. When `beginning` is true, the listener will be place before any existing listeners. It's otherwise added at the end of the list.

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### removeEventListener

```typescript
function removeEventListener(name: string, handler: function): void
```

Detach an event listener from the data source. `handler` and `type` must match what were given to `addEventListener()`.

Inherited from [relaks-event-emitter](https://github.com/chung-leong/relaks-event-emitter).

### activate

```typescript
function activate(): void
```

Activate the data source, allowing it to fetch data from a remote server.

### deactivate

```typescript
function deactivate(): void
```

Deactivate the data source, keeping it from performing data requests. Operations that require accessing a remote server will be on hold indefinitely, until `activate()` is called.

The data source will continue to return cached data after its deactivation.

### fetchList

```typescript
async function fetchList(url: string, options?: object): object[]
```

Conceptually, fetch all objects in a directory. In actuality, the method will only return the first page of results initially (when pagination is enabled). Attached to the returned array will be a method called `more()`. When it's called, an additional page will be fetched and appended to the list.

This method is designed for handling large result sets with continuous scrolling (as opposed to traditional pagination).

In addition to `more()`, the returned array will also have the property `total`. It's the number of objects in the directory on the server. The standard property `length` gives the number of objects already retrieved.

`more()` and `total` are always present, even when pagination is not available. A call to `more()` does nothing when there are no more pages.

By default, `fetchList()` will return as soon as it has one page of results. Specifying the option `minimum` forces it to wait until a certain number of objects have become available. When `minimum` is a negative number, that's interpreted as the difference from the total. When `minimum` is a string, it's expected to hold a percentage of the total. For example, `100%` means the complete data set.

**Options:**

* `minimum` - the minimum number of objects to fetch (default: any)
* `abbreviated` - indicates that the objects found at `url` do not have all their properties and they should not be used to fulfill calls to `fetchOne()`
* `afterInsert` - see [afterInsert](#afterinsert) (default: "refresh")
* `afterUpdate` - see [afterUpdate](#afterupdate) (default: "refresh")
* `afterDelete` - see [afterDelete](#afterdelete) (default: "remove")

### fetchMultiple

```typescript
async function fetchMultiple(urls: string[], options?: object): object[]
```

Fetch multiple objects in a single call. This is convenience method designed for handling one-to-many relations. It calls `fetchOne()` internally.

By default, the promise returned by `fetchMultiple()` is not fulfilled until every object is retrieved from the remote server. When the option `minimum` is specified, the promise will fulfill immediately when the number of cached objects meets the requirement. `null` will appear in place of an object in the array when it's uncached. When the uncached objects eventually arrive, the data source emits a `change` event. Subsequent calls to `fetchMultiple()` will then return all requested objects.

**Options:**

* `minimum` - the minimum number of objects to fetch (default: all)

### fetchOne

```typescript
async function fetchOne(url: string, options?: object): object
```

Fetch an object from the server. This method will check the results of calls to [fetchPage()](#fetchpage) and [fetchList()](#fetchlist) to see if the object in question hasn't been fetched already.

**Options:**

* `afterUpdate` - see [afterUpdate](#afterupdate) (default: "replace")
* `afterDelete` - see [afterDelete](#afterdelete) (default: "remove")

### fetchPage

```typescript
async function fetchPage(url: string, page: number, options?: object): object[]
```

Fetch a single page of a directory listing. All objects will be returned if the server doesn't support pagination.

**Options:**

* `abbreviated` - indicates that the objects found at `url` do not have all their properties and they should not be used to fulfill calls to `fetchOne()`
* `afterInsert` - see [afterInsert](#afterinsert) (default: `"refresh"`)
* `afterUpdate` - see [afterUpdate](#afterupdate) (default: `"refresh"`)
* `afterDelete` - see [afterDelete](#afterdelete) (default: `"refresh"`)

### invalidate

```typescript
function invalidate(time: string): boolean
```

Flag matching data queries performed before the specified time as out-of-date. `time` should be an ISO timestamp (a `Date` object is also acceptable). The methods returns `true` when queries have been invalidated and `false` otherwise.

The data source emits a `change` event when queries are invalidated.

### invalidateList

```typescript
function invalidateList(url:string, options?: object): boolean
```

Invalidate a query performed earlier using `fetchList()`.

### invalidateMultiple

```typescript
function invalidateMultiple(urls:string[], options?: object): boolean
```

Invalidate multiple queries performed earlier using `fetchOne()`.

### invalidatePage

```typescript
function invalidatePage(url:string, page: number, options?: object): boolean
```

Invalidate a query performed earlier using `fetchPage()`.

### invalidateOne

```typescript
function invalidateOne(url:string, options?: object): boolean
```

Invalidate a query performed earlier using `fetchOne()`.

### deleteOne

```typescript
async function deleteOne(folderURL: string, object: object): object
```

```typescript
async function deleteOne(object: object): object
```

Delete an object on the remote server. The `afterDelete` hooks of cached queries are invoked afterward.

When URL keys are used, `folderURL` can be omitted (since the object contains its own URL).

### deleteMultiple

```typescript
function deleteMultiple(folderURL: string, objects: object[]): object[]
```

```typescript
function deleteMultiple(objects: object[]): object[]
```

Delete multiple objects on the remote server. The `afterDelete` hooks of cached queries are invoked afterward.

When URL keys are used, `folderURL` can be omitted (since the objects contain their own URLs).

### insertOne

```typescript
async function insertOne(folderURL: string, object: object): object
```

Insert an object into a directory on the remote server. The `afterInsert` hooks of cached queries are invoked afterward. The inserted object will be available through `fetchOne()` immediately.

### insertMultiple

```typescript
async function  insertMultiple(folderURL: string, objects: object[]): object[]
```

Insert multiple objects into a directory on the remote server. The `afterInsert` hooks of cached queries are invoked afterward. The inserted objects will be available through `fetchOne()` immediately.

### updateOne

```typescript
async function updateOne(folderURL: string, object: object): object
```

```typescript
async function updateOne(object: object): object
```

Update an object on the remote server. The `afterUpdate` hooks of cached queries are invoked afterward.

When URL keys are used, `folderURL` can be omitted (since the object contains its own URL).

### updateMultiple

```typescript
function updateMultiple(folderURL: string, objects: object[]): object[]
```

```typescript
function updateMultiple(objects: object[]): object[]
```

Update multiple objects on the remote server. The `afterUpdate` hooks of cached queries are invoked afterward.

When URL keys are used, `folderURL` can be omitted (since the objects contain their own URLs).

### authenticate

```typescript
async function authenticate(loginURL: string, credentials: object, allowURLs?: string[]): boolean
```

Gain elevated access to a Django server. `loginURL` is the [REST endpoint for logging in](https://django-rest-auth.readthedocs.io/en/latest/api_endpoints.html#basic). `credentials` is an object containng `username` (or `email`) and `password`. `allowURLs` is the list of URLs that will become accessible. This parameter is designed for apps that access multiple servers. It can typically be omitted. Its default value is `[ "/" ]`, meaning all resources under `baseURL` will become accessible.

The fulfillment value of this method is `true` when the login process succeeds. If it fails, the promise will be rejected.

An `authorization` event occurs when the data source acquire an authorization token. This give you a chance to save the token for use in a future session.

### authorize

```typescript
async function authorize(token: string, allowURLs?: string[], fresh?: boolean): boolean
```

Provide a Django authorization token to the data source, likely one that was saved from an earlier authentication. `allowURLs` indicates the scope of access. It can typically be omitted. `fresh` indicates whether the token was just obtained from the remote server. If omitted, `evt.fresh` will be `false` in the subsequent `authorization` event. Your code can then elect not to save the token again.

The method will return a promise that immediately resolves to `false` if `token` is empty or if the data source has previously encountered a 401 or 403 error using that token.

### cancelAuthentication

```typescript
function cancelAuthentication(allowURLs?: string[]): void
```

Tell the data source to stop waiting for authentication. Operations that had encountered the HTTP status code 401 will then fail.

### cancelAuthorization

```typescript
function cancelAuthorization(denyURLs?: string[]): void
```

Remove authorization to certain URLs. This can be used to force the user to authenticate again before a sensitive area of your app can be accessed.

This method does not trigger any event.

### isAuthorized

```typescript
function isAuthorized(url?: string): boolean
```

Return true if the data source has an authorization token for the identicated location. `url` can be omitted, in which case it defaults to `"/"`.

### revokeAuthorization

```typescript
function revokeAuthorization(logoutURL: string, denyURLs?: string[]): void
```

Log out from a Django server. `logoutURL` is the [REST endpoint for logging out](https://django-rest-auth.readthedocs.io/en/latest/api_endpoints.html#basic). `denyURLs` is the list of URLs from which authorization will be removed. It can typically be omitted.

An `deauthorization` event will occur afterward. This give you a chance to remove a saved authorization token.

A change event will also occur after the data source removed cached queries.

### delete

```typescript
async function delete(url: string): null
```

Low-level function that performs an HTTP DELETE operation.

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

## Hooks

* [afterDelete](#afterdelete)
* [afterInsert](#afterinsert)
* [afterUpdate](#afterupdate)

### afterDelete

When objects are deleted using `deleteOne()` or `deleteMultiple()`, a query's `afterDelete` hook is invoked so that cached results are updated.

For queries performed through `fetchOne()`, the hook function has the form:

```typescript
function afterDeleteHook(object: object, deletedObject: object): object
```

`object` is the cached object before, while `deletedObject` is a copy of the same object. If the function returns an object, that'll be the result when the query is run again. If it returns `true`, then the query is removed from the cache (the default behavior). If it returns `false`, then the object will continue to be available despite its disappearance on the server.

For queries performed through `fetchPage()` or `fetchList`, the hook function has the form:

```typescript
function afterDeleteHook(objects: objects[], deletedObjects: objects[]): objects[]
```

`objects` are the currently cached objects, while `deletedObjects` is a list of deleted objects. The function should return a new array not containing the deleted objects (the default behavior). If there's no change, it should return `false`. If it returns `true`, the query will be refreshed.

A string can be used to specify a predefined hook function. The possible values are `"refresh"`, `"ignore"`, `"remove"`.

### afterInsert

When new objects are inserted into a directory using `insertOne()` or `insertMultiple()`, a query's `afterInsert` hook is invoked so that cached results are updated. Only queries performed through `fetchPage()` or `fetchList()` have this hook.

The hook function has the following form:

```typescript
function afterInserHook(objects: object[], newObjects: object[]): objects[]
```

`objects` are the currently cached objects, while `newObjects` is a list of newly created objects. The function should return a new array with the new objects inserted at the correct positions. If there's no change (because none of the new objects actually matches the query), the function should return `false`. If the function return `true`, the query will be invalidated.

A string can be used to specify a predefined hook function. The possible values are `"refresh"`, `"ignore"`, `"unshift"`, and `"push"`.

### afterUpdate

When existing objects are modified using `updateOne()` or `updateMultiple()`, a query's `afterUpdate` hook is invoked so that cached results are updated. It's also invoked when the data source fetches a more recent copy of an object. Consider the following scenario:

1. `fetchOne()` retrieves object A from the server
2. Object A is modified on the server side
3. `fetchList()` retrieves object A, B, C, and D from the server

Query 1's `afterUpdate` hook will be invoked because query 3 has obtained a newer copy of object A. Since the default hook in this case is `"replace"`, query 1 will now also yield the newer copy.

For queries performed through `fetchOne()`, the hook function has the form:

```typescript
function afterUpdateHook(object: object, newObject: object): object
```

`object` is the cached object before, while `newObject` is the object returned by the server after the save operation. If the function returns an object, then that becomes the cached object. If it returns `false`, that means no change occurred. If it returns `true`, the query is invalidated.

For queries performed through `fetchPage()` or `fetchList`, the hook function has the form:

```typescript
function afterUpdateHook(objects: object[], newObjects: object[]): object[]
```

`objects` are the currently cached objects, while `newObjects` is a list of modified objects. The function should return a new array with old objects replaced by new ones. If there's no change, the function should return `false`. If the function return `true`, the query will be invalidated.

The function might need to sort the objects if changes can impact their order.

A string can be used to specify a predefined hook function. The possible values are `"refresh"`, `"ignore"`, `"replace"`.

## Predefined hook functions

* `"ignore"` - return false to indicate there's no need to change the cached results
* `"push"` - place new objects at the end of the list
* `"refresh"` - return true to request refreshing of the query
* `"remove"` - remove deleted objects from the list
* `"replace"` - replace currently cached objects with the updated copy from the server
* `"unshift"` - place new objects at the beginning of the list

## Events

* [authentication](#authentication)
* [authorization](#authorization)
* [change](#change)
* [deauthorization](#deauthorization)

### authentication

An `authentication` event is emitted when the server responds to a request with the HTTP status code 401 ("Unauthorized").

**Default action:**

Wait for authentication to occur then try again.

**Properties:**

* `url` - the URL that triggered the 401 response
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was called
* `target` - the data source
* `type` - `"authentication"`

**Methods:**

* `postponeDefault(promise: Promise)` - wait for given promise to be fulfilled and fail the operation if the fulfillment value is false
* `preventDefault()` - fail the operation that trigger the authentication request
* `stopImmediatePropagation()` - stop other listeners from receiving the event

### authorization

An `authorization` event is emitted when the data source receives an authorization token, either from the server after a call to `authenticate()` or from your app via `authorize()`. A `change` event will follow if the default action is not prevented.

**Default action:**

Allow operations waiting for authentication to proceed.

**Properties:**

* `allowURLs` - a list of URLs that have become accessible
* `fresh` - whether the token was freshly issued by the server
* `token` - the authorization token
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was called
* `target` - the data source
* `type` - `"authorization"`

**Methods:**

* `postponeDefault(promise: Promise)` - postpone the decision on whether to proceed until the given promise is fulfilled
* `preventDefault()` - stop pending operations from proceeding despite authorization having been granted
* `stopImmediatePropagation()` - stop other listeners from receiving the event

Generally, there's no reason to prevent the default behavior from happen. Doing so only makes sense if the app has failEd to gain some other necessary authorization.

### change

A `change` event is emitted whenever rerunning queries might yield new result sets. It's also emitted after the data source has gained or lost autorization.

**Properties:**

* `propagationStopped` - whether `stopImmediatePropagation()` was called
* `target` - the data source
* `type` - `"change"`

**Methods:**

* `stopImmediatePropagation()` - stop other listeners from receiving the event

### deauthorization

A `deauthorization` event is emitted after `revokeAuthorization()` has logged out from a Django server. A `change` event will follow even if the default action is prevented.

**Default action:**

Clear cache queries.

**Properties:**

* `denyURLs` - a list of URLs that might no longer be accessible
* `defaultPrevented` - whether `preventDefault()` was called
* `propagationStopped` - whether `stopImmediatePropagation()` was called
* `target` - the data source
* `type` - `"deauthorization"`

**Methods:**

* `postponeDefault(promise: Promise)` - postpone the clearing of cached queries until the given promise is fulfilled
* `preventDefault()` - prevent clearing of cached queries
* `stopImmediatePropagation()` - stop other listeners from receiving the event

## Examples

* [Starwars API: Episode V](https://github.com/chung-leong/relaks-starwars-example-sequel) - sequel to the first Starwars API example
* [Starwars API: Episode VI - The Server Strikes Back](https://github.com/chung-leong/relaks-starwars-example-isomorphic) - demonstrates how to create an isomorphic app
* [Django todo list](https://github.com/chung-leong/relaks-django-todo-example) - demonstrates authentication and data saving using [relaks-django-data-source](https://github.com/chung-leong/relaks-django-data-source)

## License

This project is licensed under the MIT License - see the [LICENSE](#LICENSE) file for details
