import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var testURL = `http://localhost:${port}/test`;

describe('Basic HTTP operations:', function() {
    before(function() {
        return TestServer.start(port);
    })

    describe('#get()', function() {
        it ('should be able to perform a GET request', function() {
            var dataSource = new DjangoDataSource;
            dataSource.activate();
            return dataSource.get(testURL).then((response) => {
                expect(response).to.have.property('status', 'ok');
            })
        })
    })
    describe('#post()', function() {
        it ('should be able to perform a POST request', function() {
            var dataSource = new DjangoDataSource;
            dataSource.activate();
            return dataSource.post(testURL, {}).then((response) => {
                expect(response).to.have.property('status', 'ok');
            })
        })
    })
    describe('#put()', function() {
        it ('should be able to perform a PUT request', function() {
            var dataSource = new DjangoDataSource;
            dataSource.activate();
            return dataSource.put(testURL, {}).then((response) => {
                expect(response).to.have.property('status', 'ok');
            })
        })
    })
    describe('#delete()', function() {
        it ('should be able to perform a DELETE request', function() {
            var dataSource = new DjangoDataSource;
            dataSource.activate();
            return dataSource.delete(testURL, {}).then((response) => {
                expect(response).to.have.property('status', 'ok');
            })
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
