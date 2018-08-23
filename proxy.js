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

prototype.insertOne = function(dirURL, object) {
    return this.dataSource.insertOne(dirURL, object);
};

prototype.insertMultiple = function(dirURL, objects) {
    return this.dataSource.insertMultiple(dirURL, objects);
};

prototype.updateOne = function(dirURL, object) {
    return this.dataSource.updateOne(dirURL, object);
};

prototype.updateMultiple = function(dirURL, objects) {
    return this.dataSource.updateMultiple(dirURL, objects);
};

prototype.deleteOne = function(dirURL, object) {
    return this.dataSource.deleteOne(dirURL, object);
};

prototype.deleteMultiple = function(dirURL, objects) {
    return this.dataSource.deleteMultiple(dirURL, objects);
};

prototype.authenticate = function(url, credentials) {
    return this.dataSource.authenticate(url, credentials);
};

prototype.cancelAuthentication = function(url) {
    return this.dataSource.cancelAuthentication(url);
};

module.exports = RelaksDjangoDataSourceProxy;
