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
    it ('should mark queries conducted before a given time', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchOne('/tasks/1/').then((object) => {
            return dataSource.fetchPage('/tasks/', 3).then((page) => {
                var time = new Date;
                var result = dataSource.invalidate(time);
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
                var result = dataSource.invalidate(time);
                expect(result).to.be.false;
                expect(dataSource.isCached('/tasks', true)).to.be.true;
                expect(dataSource.isCached('/tasks/1', true)).to.be.true;
            });
        });
    })
    it ('should cause page queries to be removed from cache momentarily', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        return dataSource.fetchPage('/tasks/', 2).then((page2) => {
            return dataSource.fetchPage('/tasks/', 3).then((page3) => {
                var result = dataSource.invalidate();

                return dataSource.fetchPage('/tasks/', 2).then((page2) => {
                    var object = page3[0];
                    expect(dataSource.isCached(`/tasks/${object.id}`)).to.be.false;

                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 1500);
                    }).then(() => {
                        expect(dataSource.isCached(`/tasks/${object.id}`)).to.be.true;
                    });
                });
            });
        });
    })

    after(function() {
        return TestServer.stop();
    })
});
