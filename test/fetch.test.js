import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

describe('Fetch methods', function() {
    before(function() {
        return TestServer.start(7777);
    })

    var dataSource = new DjangoDataSource({
        baseURL: 'http://localhost:7777/api'
    });
    describe('#fetchOne', function() {
        it ('should fetch an object from remote server', function() {
            return dataSource.fetchOne('/tasks/5').then((object) => {
                expect(object).to.have.property('id').that.equals(5);
                expect(object).to.have.property('category').that.equals('drinking');
            })
        })
        it ('should fail with status code 404 when object does not exist', function() {
            return dataSource.fetchOne('/tasks/555').then((object) => {
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
