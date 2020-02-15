class RelaksDjangoDataSourceProxy {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  fetchOne(url, options) {
    return this.dataSource.fetchOne(url, options);
  }

  fetchList(url, options) {
    return this.dataSource.fetchList(url, options);
  }

  fetchMultiple(urls, options) {
    return this.dataSource.fetchMultiple(urls, options);
  }

  fetchPage(url, page, options) {
    return this.dataSource.fetchPage(url, page, options);
  }

  insertOne(folderURL, object) {
    return this.dataSource.insertOne(folderURL, object);
  }

  insertMultiple(folderURL, objects) {
    return this.dataSource.insertMultiple(folderURL, objects);
  }

  updateOne(folderURL, object) {
    return this.dataSource.updateOne(folderURL, object);
  }

  updateMultiple(folderURL, objects) {
    return this.dataSource.updateMultiple(folderURL, objects);
  }

  deleteOne(folderURL, object) {
    return this.dataSource.deleteOne(folderURL, object);
  }

  deleteMultiple(folderURL, objects) {
    return this.dataSource.deleteMultiple(folderURL, objects);
  }

  authenticate(url, credentials) {
    return this.dataSource.authenticate(url, credentials);
  }

  cancelAuthentication(url) {
    return this.dataSource.cancelAuthentication(url);
  }
}

export {
  RelaksDjangoDataSourceProxy,
  RelaksDjangoDataSourceProxy as DataSourceProxy,
};
