class RelaksDjangoDataSourceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export {
  RelaksDjangoDataSourceError,
  RelaksDjangoDataSourceError as DataSourceError,
};
