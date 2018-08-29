import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe('Insert methods:', function() {
    before(function() {
        return TestServer.start(port);
    })

    describe('#insertOne()', function() {
        it ('should insert an object into remote database', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var object = {
                title: 'Meet attractive women',
                description: 'In order to better understand quantum mechanics',
                category: 'social',
            };
            return dataSource.insertOne('/tasks/', object).then((insertedObject) => {
                expect(insertedObject).to.have.property('id', 101)
                expect(insertedObject).to.have.property('category', 'social');
            }).then(() => {
                // bypass cache and fetch object directly
                return dataSource.get(`${baseURL}/tasks/101/`).then((fetchedObject) => {
                    expect(fetchedObject).to.have.property('category', 'social');
                });
            });
        })
        it ('should fail with status code 404 when object type does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var object = {
                title: 'Date attractive women',
                description: 'To enhance the quality of business software',
                category: 'analytic',
            };
            return dataSource.insertOne('/jobs/', object).then((object) => {
                throw new Error('Operation should fail');
            }, (err) => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.have.property('status', 404);
            })
        })
    })
    describe('#insertMultiple()', function() {
        before(function() {
            return TestServer.reset();
        })

        it ('should append objects to existing query', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterInsert: 'push' };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var objects = [
                    {
                        title: 'Meet attractive women',
                        description: 'In order to better understand quantum mechanics',
                        category: 'social',
                    },
                    {
                        title: 'Seduce attractive women',
                        description: 'To unlock mysteries concerning violations of time reserval symmetry',
                        category: 'physics',
                    }
                ];
                return dataSource.insertMultiple('/tasks/', objects).then((insertedObjects) => {
                    return dataSource.fetchList('/tasks/', options).then((objects) => {
                        expect(objects).to.have.property('length', 102);
                        expect(objects[100]).to.have.property('category', 'social');
                        expect(objects[101]).to.have.property('category', 'physics');
                    });
                });
            });
        });
        it ('should prepend objects to existing query', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterInsert: 'unshift' };
            return dataSource.fetchList('/tasks/', options).then((objects) => {
                var objects = [
                    {
                        title: 'Meet attractive women',
                        description: 'In order to better understand quantum mechanics',
                        category: 'social',
                    },
                    {
                        title: 'Seduce attractive women',
                        description: 'To unlock mysteries concerning violations of time reserval symmetry',
                        category: 'physics',
                    }
                ];
                return dataSource.insertMultiple('/tasks/', objects).then((insertedObjects) => {
                    return dataSource.fetchList('/tasks/', options).then((objects) => {
                        expect(objects[1]).to.have.property('category', 'social');
                        expect(objects[0]).to.have.property('category', 'physics');
                    });
                });
            });
        });
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

                    var objects = [
                        {
                            title: 'Eat cake',
                            description: '\'Cause there is no bread',
                            category: 'eating',
                        },
                    ];
                    dataSource.insertMultiple('/tasks/', objects);
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
                    return dataSource.fetchList('/tasks/').then((objects) => {
                        // we shouldn't see any changes yet
                        objects.forEach((object) => {
                            expect(object).to.not.have.property('category', 'eating');
                        })
                    });
                });
            }).then(() => {
                return dataSource.fetchList('/tasks/').then((objects) => {
                    // now the changes show up
                    var object = objects[objects.length - 1];
                    expect(object).to.have.property('category', 'eating');
                });
            });
        });
    })

    after(function() {
        return TestServer.stop();
    })
})
