import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

describe('Update methods:', function() {
    before(function() {
        return TestServer.start(7777);
    })

    describe('#updateOne()', function() {
        var dataSource = new DjangoDataSource({
            baseURL: 'http://localhost:7777/api'
        });
        it ('should be able to update an object', function() {
            return dataSource.fetchOne('/tasks/6').then((object) => {
                object.category = 'religion';
                return dataSource.updateOne('/tasks/', object).then((updatedObject) => {
                    expect(updatedObject).to.have.property('category').that.equals('religion');

                    // this should be cached
                    return dataSource.fetchOne('/tasks/6').then((cachedObject) => {
                        expect(cachedObject).to.have.property('category').that.equals('religion');
                        expect(cachedObject).to.deep.equal(updatedObject);
                    });
                })
            }).then(() => {
                // bypass cache and fetch object directly
                return dataSource.get('http://localhost:7777/api/tasks/6').then((fetchedObject) => {
                    expect(fetchedObject).to.have.property('category').that.equals('religion');
                });
            });
        })
        it ('should fail with status code 404 when object does not exist', function() {
            var deletedObject = {
                id: 101
            };
            return dataSource.updateOne('/tasks/', deletedObject).then((object) => {
                throw new Error('Operation should fail');
            }, (err) => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.have.property('status').that.equals(404);
            })
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
