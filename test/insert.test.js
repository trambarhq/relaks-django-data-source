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

    after(function() {
        return TestServer.stop();
    })
})
