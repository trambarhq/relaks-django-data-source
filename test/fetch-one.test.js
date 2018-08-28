import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

describe('#fetchOne', function() {
    before(function() {
        return TestServer.start(7777);
    })

    var dataSource = new DjangoDataSource({
        baseURL: 'http://localhost:7777/api'
    });
    it ('should be able to perform a GET request', function() {
        return dataSource.fetchOne('/tasks/5').then((object) => {
            expect(object).to.have.property('id').that.equals(5);
            expect(object).to.have.property('category').that.equals('drinking');
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
