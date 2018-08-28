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
                return dataSource.fetchOne('/tasks/6').then((object) => {
                    object.category = 'religion';
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

    after(function() {
        return TestServer.stop();
    })
})
