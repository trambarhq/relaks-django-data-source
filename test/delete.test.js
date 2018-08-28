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
                            expect(objects).to.have.property('length', 99);
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
                            expect(objects).to.have.property('length', 99);
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

    after(function() {
        return TestServer.stop();
    })
})
