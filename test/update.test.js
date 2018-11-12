import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe('Update methods:', function() {
    before(function() {
        return TestServer.start(port);
    })

    describe('#updateOne()', function() {
        describe('(numeric keys)', function() {
            it ('should update an object', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                // omitting trailing slash on purpose
                return dataSource.fetchOne('/tasks/6').then((object) => {
                    object = Object.assign({}, object, { category: 'religion' });
                    return dataSource.updateOne('/tasks/', object).then((updatedObject) => {
                        expect(updatedObject).to.have.property('category', 'religion');

                        // this should be cached
                        return dataSource.fetchOne('/tasks/6').then((cachedObject) => {
                            expect(cachedObject).to.have.property('category', 'religion');
                            expect(cachedObject).to.deep.equal(updatedObject);
                        });
                    })
                }).then(() => {
                    // bypass cache and fetch object directly
                    return dataSource.get(`${baseURL}/tasks/6`).then((fetchedObject) => {
                        expect(fetchedObject).to.have.property('category', 'religion');
                    });
                });
            })
            it ('should fail with status code 404 when object does not exist', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var deletedObject = {
                    id: 101
                };
                return dataSource.updateOne('/tasks/', deletedObject).then((object) => {
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

            it ('should update an object', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchOne('/tasks/6').then((object) => {
                    object.category = 'religion';
                    return dataSource.updateOne(object).then((updatedObject) => {
                        expect(updatedObject).to.have.property('category', 'religion');
                    })
                });
            })
        })
    })
    describe('#updateMultiple()', function() {
        before(function() {
            return TestServer.reset();
        })

        it ('should replace objects in list query afterward when "replace" is specified', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterUpdate: 'replace' };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var slice = objects.slice(0, 5).map((object) => {
                    return Object.assign({}, object, { category: 'religion' });
                });
                return dataSource.updateMultiple('/tasks/', slice).then((updatedObjects) => {
                    return dataSource.fetchList('/tasks/', options).then((objects) => {
                        var slice = objects.slice(0, 5);
                        slice.forEach((object, index) => {
                            expect(object).to.equal(updatedObjects[index]);
                        });
                    });
                });
            });
        })
        it ('should not trigger change event when "replace" is specified', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterUpdate: 'replace' };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var slice = objects.slice(0, 5).map((object) => {
                    return Object.assign({}, object, { category: 'religion' });
                });
                return new Promise((resolve, reject) => {
                    dataSource.addEventListener('change', reject);
                    setTimeout(resolve, 100);
                    dataSource.updateMultiple('/tasks/', slice);
                });
            });
        })
        it ('should trigger refreshing of list query by default', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchList('/tasks/').then((objects) => {
                return new Promise((resolve, reject) => {
                    // promise will resolve when change event occurs
                    var onChange = () => {
                        dataSource.removeEventListener('change', onChange);
                        resolve();
                    };
                    dataSource.addEventListener('change', onChange);
                    setTimeout(reject, 100);

                    var slice = objects.slice(10, 15).map((object) => {
                        return Object.assign({}, object, { category: 'religion' });
                    });
                    dataSource.updateMultiple('/tasks/', slice);
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
                    dataSource.fetchList('/tasks/').then((objects) => {
                        // we shouldn't see any changes yet
                        var slice = objects.slice(10, 15);
                        slice.forEach((object) => {
                            expect(object).to.have.property('category', 'drinking');
                        });
                    });
                });
            }).then(() => {
                return dataSource.fetchList('/tasks/').then((objects) => {
                    // now the changes show up
                    var slice = objects.slice(10, 15);
                    slice.forEach((object) => {
                        expect(object).to.have.property('category', 'religion');
                    });
                });
            });
        })
        it ('should fail with when one of the objects does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var objects = [
                { id: 100, title: 'Dobchinsky' },
                { id: 101, title: 'Bobchinsky' },
            ];
            return expect(dataSource.updateMultiple('/tasks/', objects))
                .to.eventually.be.rejectedWith(Error)
                .that.contains.keys('results', 'errors')
                .that.satisfy((err) => !err.errors[0] && !!err.errors[1])
                .that.satisfy((err) => !!err.results[0] && !err.results[1]);
        })
        it ('should force refresh when an error occurs', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterUpdate: 'replace' };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var missing = objects[3]
                var present = objects[4];
                // remove object in backend
                TestServer.remove(missing.id);
                return new Promise((resolve, reject) => {
                    dataSource.addEventListener('change', resolve);
                    setTimeout(reject, 100);

                    var slice = [ missing, present ];
                    dataSource.updateMultiple('/tasks/', slice);
                });
            }).then(() => {
                expect(dataSource.isCached('/tasks/')).to.be.true;
                expect(dataSource.isCached('/tasks/', true)).to.be.false;
            });
        })
    });

    after(function() {
        return TestServer.stop();
    })
})
