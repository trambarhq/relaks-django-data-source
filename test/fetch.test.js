import Chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

Chai.use(ChaiAsPromised);

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe('Fetch methods:', function() {
    before(function() {
        return TestServer.start(port);
    })

    describe('#fetchOne', function() {
        it ('should fetch an object from remote server', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne(`/tasks/5/`).then((object) => {
                expect(object).to.have.property('id', 5);
                expect(object).to.have.property('category', 'drinking');
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
                expect(err).to.have.property('status', 404);
            });
        })
        it ('should invalidate a query by fetchList() when a fresher copy is retrieved', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { minimum: '100%' };
            return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                var object1 = objects[0];
                return TestServer.update(object1.id, { category: 'something' }).then(() => {
                    // invalidate fetchOne() query (which gets created automatically)
                    expect(dataSource.invalidateOne(`/tasks/${object1.id}`)).to.be.true;
                    return new Promise((resolve, reject) => {
                        // trigger refresh and wait for change event
                        dataSource.addEventListener('change', resolve);
                        dataSource.fetchOne(`/tasks/${object1.id}`);
                    });
                }).then(() => {
                    return dataSource.fetchOne(`/tasks/${object1.id}`).then((object) => {
                        expect(object).to.have.property('category', 'something');
                        expect(dataSource.isCached('/tasks/', true)).to.be.false;
                    });
                });
            });
        });
        it ('should replace object in a query by fetchList() when a fresher copy is retrieved', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { minimum: '100%', afterUpdate: 'replace' };
            return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                var object2 = objects[1];
                return TestServer.update(object2.id, { category: 'bingo' }).then(() => {
                    // invalidate fetchOne() query (which gets created automatically)
                    expect(dataSource.invalidateOne(`/tasks/${object2.id}`)).to.be.true;
                    return new Promise((resolve, reject) => {
                        // trigger refresh and wait for change event
                        dataSource.addEventListener('change', resolve);
                        dataSource.fetchOne(`/tasks/${object2.id}`);
                    });
                }).then(() => {
                    return dataSource.fetchOne(`/tasks/${object2.id}`).then((object) => {
                        expect(object).to.have.property('category', 'bingo');
                        expect(dataSource.isCached('/tasks/', true)).to.be.true;
                        return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                            var object2 = objects[1];
                            expect(object2).to.have.property('category', 'bingo');
                        });
                    });
                });
            });
        });
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
                    expect(err).to.have.property('status', 404);
                });
            })
            it ('should invalidate another query by when fresher objects are retrieved', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: '100%' };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    var object1 = objects[0];
                    return TestServer.update(object1.id, { category: 'something' }).then(() => {
                        return dataSource.fetchList(`/tasks/?sort=1`, options).then((objects) => {
                            expect(dataSource.isCached('/tasks/', true)).to.be.false;
                            expect(dataSource.isCached('/tasks/?sort=1', true)).to.be.true;
                        });
                    });
                });
            });
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
                        expect(objects2).to.have.length(30);
                        expect(changeEvent).to.be.an.object;

                        return dataSource.fetchList(`/tasks/`).then((objects3) => {
                            expect(objects3).to.equal(objects2);
                        });
                    });
                });
            })
            it ('should fetch enough records to meet minimum requirement', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: 25 };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    // 15 * 2 > 25
                    expect(objects).to.have.length(30);
                });
            })
            it ('should interpret negative minimum as that amount off the total', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: -25 };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    // 15 * 5 = 100 - 25
                    expect(objects).to.have.length(75);
                });
            })
            it ('should handle minimum specified as percentage', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: ' 25% ' };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    // 15 * 2 > 100 * 25%
                    expect(objects).to.have.length(30);
                });
            })
            it ('should handle minimum specified as negative percentage', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: ' -20% ' };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    // 15 * 6 > 100 - (100 * 20)%
                    expect(objects).to.have.length(90);
                });
            })
            it ('should invalidate another query by when fresher objects are retrieved', function() {
                var dataSource = new DjangoDataSource({ baseURL });
                var options = { minimum: '100%' };
                return dataSource.fetchList(`/tasks/`, options).then((objects) => {
                    var object1 = objects[0];
                    return TestServer.update(object1.id, { category: 'something' }).then(() => {
                        return dataSource.fetchList(`/tasks/?sort=1`, options).then((objects) => {
                            expect(dataSource.isCached('/tasks/', true)).to.be.false;
                            expect(dataSource.isCached('/tasks/?sort=1', true)).to.be.true;
                        });
                    });
                });
            });
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
                expect(err).to.have.property('status', 404);
            });
        })
    })
    describe('#fetchMultiple()', function() {
        before(function() {
            return TestServer.reset();
        })

        it ('should fetch multiple objects', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var urls = [];
            for (var i = 1; i <= 20; i += 2) {
                urls.push(`/tasks/${i}`);
            }
            return dataSource.fetchMultiple(urls).then((objects) => {
                expect(objects).to.have.length(10);
            });
        })
        it ('should return partial results when the number meet the mimimum specified', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var urls = [];
            for (var i = 1; i <= 20; i += 2) {
                urls.push(`/tasks/${i}`);
            }
            return dataSource.fetchMultiple(urls).then((objects) => {
                var urls = [];
                for (var i = 1; i <= 20; i += 1) {
                    urls.push(`/tasks/${i}`);
                }
                var options = { minimum: '50%' };
                return dataSource.fetchMultiple(urls, options).then((objects) => {
                    expect(objects).to.have.length(20);
                    expect(objects.filter(Boolean)).to.have.length(10);
                    expect(objects[1]).to.be.null;
                });
            });
        })
        it ('should trigger change event once full list becomes available', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var urls = [];
            for (var i = 1; i <= 20; i += 2) {
                urls.push(`/tasks/${i}`);
            }
            return dataSource.fetchMultiple(urls).then((objects) => {
                var urls = [];
                for (var i = 1; i <= 20; i += 1) {
                    urls.push(`/tasks/${i}`);
                }
                var options = { minimum: '50%' };
                return dataSource.fetchMultiple(urls, options).then((objects) => {
                    expect(objects.filter(Boolean)).to.have.length(10);
                    return new Promise((resolve, reject) => {
                        // only got half the list
                        dataSource.addEventListener('change', resolve);
                        setTimeout(reject, 100);
                    });
                }).then((evt) => {
                    expect(evt).to.have.property('type', 'change');

                    return dataSource.fetchMultiple(urls, options).then((objects) => {
                        // all objects should be there
                        expect(objects.filter(Boolean)).to.have.length(20);
                    });
                });
            });
        })
        it ('should fail with when one of the objects does not exist', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var urls = [
                `/tasks/99`,
                `/tasks/100`,
                `/tasks/101`,
            ];
            return expect(dataSource.fetchMultiple(urls))
                .to.eventually.be.rejectedWith(Error)
                .that.contains.keys('results', 'errors');
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
