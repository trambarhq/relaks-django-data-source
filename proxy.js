function RelaksDjangoDataSourceProxy(dataSource) {
    this.dataSource = dataSource;
}

var prototype = RelaksDjangoDataSourceProxy.prototype;

prototype.fetchOne = function(url, options) {
    return this.dataSource.fetchOne(url, options);
};

prototype.fetchList = function(url, options) {
    return this.dataSource.fetchList(url, options);
};

prototype.fetchMultiple = function(urls, options) {
    return this.dataSource.fetchMultiple(urls, options);
};

prototype.fetchPage = function(url, page, options) {
    return this.dataSource.fetchPage(url, page, options);
};

prototype.insertOne = function(folderURL, object) {
    return this.dataSource.insertOne(folderURL, object);
};

prototype.insertMultiple = function(folderURL, objects) {
    return this.dataSource.insertMultiple(folderURL, objects);
};

prototype.updateOne = function(folderURL, object) {
    return this.dataSource.updateOne(folderURL, object);
};

prototype.updateMultiple = function(folderURL, objects) {
    return this.dataSource.updateMultiple(folderURL, objects);
};

prototype.deleteOne = function(folderURL, object) {
    return this.dataSource.deleteOne(folderURL, object);
};

prototype.deleteMultiple = function(folderURL, objects) {
    return this.dataSource.deleteMultiple(folderURL, objects);
};

prototype.authenticate = function(url, credentials) {
    return this.dataSource.authenticate(url, credentials);
};

prototype.cancelAuthentication = function(url) {
    return this.dataSource.cancelAuthentication(url);
};

module.exports = RelaksDjangoDataSourceProxy;
