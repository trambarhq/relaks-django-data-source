import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

describe('Fetch methods:', function() {
    before(function() {
        return TestServer.start(7777);
    })
    var baseURL = 'http://localhost:7777/api';

    describe('#fetchOne', function() {
        it ('should fetch an object from remote server', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne(`/tasks/5/`).then((object) => {
                expect(object).to.have.property('id').that.equals(5);
                expect(object).to.have.property('category').that.equals('drinking');
            })
        })
        it ('should cache an object', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne(`/tasks/6/`).then((object1) => {
                return dataSource.fetchOne(`/tasks/6/`).then((object2) => {
                    expect(object2).to.equal(object1);
                })
            })
        })
        it ('should fail with status code 404 when object does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne(`/tasks/555/`).then((object) => {
                throw new Error('Operation should fail');
            }, (err) => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.have.property('status').that.equals(404);
            });
        })
    })
    describe('#fetchList', function() {
        describe('(no pagination)', function() {
            before(function() {
                return TestServer.reset();
            })

            it ('should fetch all objects from remote server', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects) => {
                    expect(objects).to.be.an.instanceof(Array)
                        .that.has.property('length', 100);
                });
            })
            it ('should cache objects', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects1) => {
                    return dataSource.fetchList(`/tasks/`).then((objects2) => {
                        expect(objects2).to.equal(objects1);
                    });
                });
            })
            it ('should cache objects for fetchOne() as well', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects) => {
                    var object1 = objects[3]
                    return dataSource.fetchOne(`/tasks/${object1.id}/`).then((object2) => {
                        expect(object2).to.equal(object1);
                    });
                });
            })
            it ('should not provide objects to fetchOne() when abbreviated is set', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { abbreviated: true };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    var object1 = objects[3]
                    return dataSource.fetchOne(`/tasks/${object1.id}/`).then((object2) => {
                        expect(object2).to.not.equal(object1);
                    });
                });
            })
            it ('should return results with dummy more() function and total', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects) => {
                    expect(objects).to.have.property('more')
                        .that.is.instanceof(Function);
                    expect(objects).to.have.property('total')
                        .that.equals(100);
                });
            })
            it ('should fail with status code 404 when object type does not exist', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/jobs/`).then((object) => {
                    throw new Error('Operation should fail');
                }, (err) => {
                    expect(err).to.be.an.instanceof(Error);
                    expect(err).to.have.property('status').that.equals(404);
                });
            })
        })
        describe('(pagination)', function() {
            before(function() {
                return TestServer.reset({ pagination: true, perPage: 15 });
            })

            it ('should fetch the first page, with more() and total attached to result', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects) => {
                    expect(objects).to.be.an.instanceof(Array)
                        .that.has.property('length', 15);
                    expect(objects).to.have.property('more')
                        .that.is.instanceof(Function);
                    expect(objects).to.have.property('total')
                        .that.equals(100);
                });
            })
            it ('should trigger a change event, when more() is called', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var changeEvent;
                dataSource.addEventListener('change', (evt) => {
                    changeEvent = evt;
                })
                return dataSource.fetchList(`/tasks/`).then((objects1) => {
                    return objects1.more().then(function(objects2) {
                        expect(objects2).to.have.property('length', 30);
                        expect(changeEvent).to.be.an.object;

                        return dataSource.fetchList(`/tasks/`).then((objects3) => {
                            expect(objects3).to.equal(objects2);
                        });
                    });
                });
            })
        })
        describe('(URL keys)', function() {
            before(function() {
                return TestServer.reset({ pagination: true, urlKeys: true });
            })

            it ('should cache objects for fetchOne() as well', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                return dataSource.fetchList(`/tasks/`).then((objects) => {
                    var object1 = objects[3]
                    return dataSource.fetchOne(object1.url).then((object2) => {
                        expect(object2).to.equal(object1);
                        expect(object2).to.have.property('url');
                    });
                });
            })
        })
    })
    describe('#fetchPage()', function() {
        before(function() {
            return TestServer.reset({ pagination: true, perPage: 20 });
        })

        it ('should fetch the first page, with total attached to result', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchPage(`/tasks/`, 1).then((objects) => {
                expect(objects).to.be.an.instanceof(Array)
                    .that.has.property('length', 20);
                expect(objects).to.have.property('total')
                    .that.equals(100);
            });
        })
        it ('should fetch the second page', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchPage(`/tasks/`, 2).then((objects) => {
                expect(objects).to.be.an.instanceof(Array)
                    .that.has.property('length', 20);
                expect(objects[0]).to.have.property('id', 21);
            });
        })
        it ('should cache objects', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchPage(`/tasks/`, 2).then((objects1) => {
                return dataSource.fetchPage(`/tasks/`, 2).then((objects2) => {
                    expect(objects2).to.equal(objects1);
                });
            });
        })
        it ('should cache objects for fetchOne() as well', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchPage(`/tasks/`, 3).then((objects) => {
                var object1 = objects[3]
                return dataSource.fetchOne(`/tasks/${object1.id}/`).then((object2) => {
                    expect(object2).to.equal(object1);
                });
            });
        })
        it ('should not provide objects to fetchOne() when abbreviated is set', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { abbreviated: true };
            return dataSource.fetchPage(`/tasks/`, 3, options).then((objects) => {
                var object1 = objects[3]
                return dataSource.fetchOne(`/tasks/${object1.id}/`).then((object2) => {
                    expect(object2).to.not.equal(object1);
                });
            });
        })
        it ('should fail with status code 404 when object type does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchList(`/jobs/`).then((object) => {
                throw new Error('Operation should fail');
            }, (err) => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.have.property('status').that.equals(404);
            });
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
