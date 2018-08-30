import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe('#invalidate()', function() {
    before(function() {
        return TestServer.start(port, { pagination: true });
    })

    it ('should mark all queries as expired when no criteria are provided', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchList('/tasks/').then((list) => {
                var result = dataSource.invalidate();
                expect(result).to.be.true;
                expect(dataSource.isCached('/tasks')).to.be.true;
                expect(dataSource.isCached('/tasks', true)).to.be.false;
                expect(dataSource.isCached('/tasks/1')).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.false;
                // would derive from list if list isn't expired
                expect(dataSource.isCached('/tasks/2')).to.be.false;
            });
        });
    })
    it ('should mark queries matching URL as expired', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchList('/tasks/').then((list) => {
                var result = dataSource.invalidate({ url: baseURL });
                expect(result).to.be.true;
                expect(dataSource.isCached('/tasks')).to.be.true;
                expect(dataSource.isCached('/tasks', true)).to.be.false;
                expect(dataSource.isCached('/tasks/1')).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.false;
            });
        });
    })
    it ('should ignore queries when URL do not match', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchList('/tasks/').then((list) => {
                var result = dataSource.invalidate({ url: 'http://www.playboy.com/api/' });
                expect(result).to.be.false;
                expect(dataSource.isCached('/tasks', true)).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.true;
                // derive from list
                expect(dataSource.isCached('/tasks/2', true)).to.be.true; 
            });
        });
    })
    it ('should mark queries conducted before a given time', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchPage('/tasks/', 3).then((page) => {
                var time = new Date;
                var result = dataSource.invalidate({ url: baseURL, time });
                expect(result).to.be.true;
                expect(dataSource.isCached('/tasks')).to.be.true;
                expect(dataSource.isCached('/tasks', true)).to.be.false;
                expect(dataSource.isCached('/tasks/1')).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.false;
                expect(dataSource.isCached('/tasks/2')).to.be.false;
            });
        });
    })
    it ('should ignore queries conducted after a given time', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchPage('/tasks/', 3).then((page) => {
                var time = new Date((new Date).getTime() - 60000);
                var result = dataSource.invalidate({ url: baseURL, time });
                expect(result).to.be.false;
                expect(dataSource.isCached('/tasks', true)).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.true;
            });
        });
    })

    after(function() {
        return TestServer.stop();
    })
});
