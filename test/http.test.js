import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

describe('Basic HTTP operations', function() {
    before(function() {
        return TestServer.start(7777);
    })

    describe('#get()', function() {
        it ('should be able to perform a GET request', function() {
            var dataSource = new DjangoDataSource;
            return dataSource.get('http://localhost:7777/test').then((response) => {
                expect(response).to.have.property('status').that.equals('ok');
            })
        })
    })
    describe('#post()', function() {
        it ('should be able to perform a POST request', function() {
            var dataSource = new DjangoDataSource;
            return dataSource.post('http://localhost:7777/test', {}).then((response) => {
                expect(response).to.have.property('status').that.equals('ok');
            })
        })
    })
    describe('#put()', function() {
        it ('should be able to perform a PUT request', function() {
            var dataSource = new DjangoDataSource;
            return dataSource.put('http://localhost:7777/test', {}).then((response) => {
                expect(response).to.have.property('status').that.equals('ok');
            })
        })
    })
    describe('#delete()', function() {
        it ('should be able to perform a DELETE request', function() {
            var dataSource = new DjangoDataSource;
            return dataSource.delete('http://localhost:7777/test', {}).then((response) => {
                expect(response).to.have.property('status').that.equals('ok');
            })
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
