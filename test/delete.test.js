import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe('Delete methods:', function() {
    before(function() {
        return TestServer.start(port);
    })

    describe('#deleteOne()', function() {
        describe('(numeric keys)', function() {
            it ('should delete an object', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchOne('/tasks/55').then((object) => {
                    return dataSource.deleteOne('/tasks/', object).then(() => {
                        return dataSource.fetchList('/tasks/').then((objects) => {
                            expect(objects).to.have.length(99);
                            var result = objects.find((object) => {
                                return object.id === 55;
                            });
                            expect(result).to.be.undefined;
                        });
                    })
                });
            })

            it ('should fail with status code 404 when object does not exist', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var deletedObject = {
                    id: 101
                };
                return dataSource.deleteOne('/tasks/', deletedObject).then((object) => {
                    throw new Error('Operation should fail');
                }, (err) => {
                    expect(err).to.be.an.instanceof(Error);
                    expect(err).to.have.property('status', 404);
                })
            })
        })
        describe('(URL keys)', function() {
            before(function() {
                return TestServer.reset({ urlKeys: true });
            })

            it ('should delete an object', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchOne('/tasks/55').then((object) => {
                    return dataSource.deleteOne(object).then(() => {
                        return dataSource.fetchList('/tasks/').then((objects) => {
                            expect(objects).to.have.length(99);
                            var result = objects.find((object) => {
                                return object.id === 55;
                            });
                            expect(result).to.be.undefined;
                        });
                    })
                });
            })
        })
    })
    describe('#deleteMultiple()', function() {
        before(function() {
            return TestServer.reset();
        })

        it ('should remove objects from list query by default', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchList('/tasks/').then((objects) => {
                var slice = objects.slice(0, 5);
                return dataSource.deleteMultiple('/tasks/', slice).then((deletedObjects) => {
                    return dataSource.fetchList('/tasks/').then((objects) => {
                        objects.forEach((object) => {
                            deletedObjects.forEach((deletedObject) => {
                                expect(object.id).to.not.equal(deletedObject.id);
                            });
                        });
                    });
                });
            });
        })

        it ('should remove object query', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var urls = [ '/tasks/99', '/tasks/100' ];
            return dataSource.fetchMultiple(urls).then((objects) => {
                expect(objects).to.have.length(2);
                return dataSource.deleteMultiple('/tasks/', objects).then((deletedObjects) => {
                    return dataSource.fetchOne(urls[0]).then((object) => {
                        throw new Error('Operation should fail');
                    }, (err) => {
                        expect(err).to.be.an.instanceof(Error);
                        expect(err).to.have.property('status', 404);
                    });
                });
            });
        })
        it ('should run custom hook function', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = {
                afterDelete: (objects, deletedObjects) => {
                    return objects.map((object) => {
                        var deletedObject = deletedObjects.find((deletedObject) => {
                            return (deletedObject.id === object.id);
                        });
                        if (deletedObject) {
                            deletedObject.deleted = true;
                            return deletedObject;
                        } else {
                            return object;
                        }
                    });
                }
            };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var slice = objects.slice(0, 5);
                return dataSource.deleteMultiple('/tasks/', slice).then((deletedObjects) => {
                    return dataSource.fetchList('/tasks/', options).then((objects) => {
                        var slice = objects.slice(0, 5);
                        slice.forEach((object) => {
                            expect(object).to.have.property('deleted', true);
                        })
                    });
                });
            });
        })
        it ('should not fire change event when query has "ignore" as hook', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = {
                afterDelete: 'ignore'
            };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                return new Promise((resolve, reject) => {
                    dataSource.addEventListener('change', () => {
                        reject(new Error('There should be no change event'));
                    });

                    var slice = objects.slice(0, 5);
                    dataSource.deleteMultiple('/tasks/', slice).then(() => {
                        setTimeout(resolve, 100);
                    });
                });
            });
        })
        it ('should fail with when one of the objects does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var objects = [
                { id: 50 },
                { id: 501 },
            ];
            return expect(dataSource.deleteMultiple('/tasks/', objects))
                .to.eventually.be.rejectedWith(Error)
                .that.contains.keys('results', 'errors')
                .that.satisfy((err) => !err.errors[0] && !!err.errors[1])
                .that.satisfy((err) => !!err.results[0] && !err.results[1]);
        })
        it ('should force refresh when an error occurs', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchList('/tasks/').then((objects) => {
                return new Promise((resolve, reject) => {
                    dataSource.addEventListener('change', resolve);
                    setTimeout(reject, 100);

                    var objects = [
                        { id: 100 },
                        { id: 101 },
                    ];
                    dataSource.deleteMultiple('/tasks/', objects);
                });
            }).then(() => {
                expect(dataSource.isCached('/tasks/')).to.be.true;
                expect(dataSource.isCached('/tasks/', true)).to.be.false;
            });
        })
        describe('(pagination)', function() {
            before(function() {
                return TestServer.reset({ pagination: true });
            })

            it ('should force page query to refresh by default', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var deletedObjects;
                return dataSource.fetchPage('/tasks/', 2).then((objects) => {
                    return new Promise((resolve, reject) => {
                        // promise will resolve when change event occurs
                        var onChange = () => {
                            dataSource.removeEventListener('change', onChange);
                            resolve();
                        };
                        dataSource.addEventListener('change', onChange);
                        setTimeout(reject, 100);

                        deletedObjects = objects.slice(0, 5);
                        dataSource.deleteMultiple('/tasks/', deletedObjects);
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        // wait for another change event
                        var onChange = () => {
                            dataSource.removeEventListener('change', onChange);
                            resolve();
                        };
                        dataSource.addEventListener('change', onChange);
                        setTimeout(reject, 100);

                        // trigger the refreshing
                        dataSource.fetchPage('/tasks/', 2);
                    });
                }).then(() => {
                    return dataSource.fetchPage('/tasks/', 2).then((objects) => {
                        objects.forEach((object) => {
                            deletedObjects.forEach((deletedObject) => {
                                expect(object.id).to.not.equal(deletedObject.id);
                            });
                        });
                    });
                });
            })
        });
    })

    after(function() {
        return TestServer.stop();
    })
})
