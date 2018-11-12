import { expect } from 'chai';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

var port = 7777;
var baseURL = `http://localhost:${port}/api`;

describe(`Invalidation methods`, function() {
    before(function() {
        return TestServer.start(port, { pagination: true });
    })

    describe('#invalidate()', function() {
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
    })
    describe('#invalidateOne()', function() {
        it ('should mark a single object query as expired', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne('/tasks/1/').then((object1) => {
                return dataSource.fetchOne('/tasks/2/').then((object2) => {
                    // leaving one trailing slash on purpose
                    var result = dataSource.invalidateOne('/tasks/1');
                    expect(result).to.be.true;
                    expect(dataSource.isCached('/tasks/1')).to.be.true;
                    expect(dataSource.isCached('/tasks/1/', true)).to.be.false;
                    expect(dataSource.isCached('/tasks/2')).to.be.true;
                    expect(dataSource.isCached('/tasks/2/', true)).to.be.true;
                });
            });
        })
    })
    describe('#invalidateList()', function() {
        it ('should mark a single list query as expired', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            var options = { afterUpdate: 'replace' };
            return dataSource.fetchList('/tasks/', options).then((object1) => {
                var result = dataSource.invalidateList('/tasks/', options);
                expect(result).to.be.true;
                expect(dataSource.isCached('/tasks/')).to.be.true;
                expect(dataSource.isCached('/tasks/', true)).to.be.false;
            });
        })
    })
    describe('#invalidatePage()', function() {
        it ('should mark a single page query as expired', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchPage('/tasks/', 2).then((object1) => {
                var result1 = dataSource.invalidatePage('/tasks/', 1);
                expect(result1).to.be.false;
                var result2 = dataSource.invalidatePage('/tasks/', 2);
                expect(result2).to.be.true;
                expect(dataSource.isCached('/tasks/')).to.be.true;
                expect(dataSource.isCached('/tasks/', true)).to.be.false;
            });
        })
    })
    describe('#invalidateMultiple()', function() {
        it ('should mark multiple object queries as expired', function() {
            var dataSource = new DjangoDataSource({ baseURL });
            return dataSource.fetchOne('/tasks/1/').then((object1) => {
                return dataSource.fetchOne('/tasks/2/').then((object2) => {
                    var urls = [ '/tasks/1/', '/tasks/2/' ];
                    var result = dataSource.invalidateMultiple(urls);
                    expect(result).to.be.true;
                    expect(dataSource.isCached('/tasks/1')).to.be.true;
                    expect(dataSource.isCached('/tasks/1/', true)).to.be.false;
                    expect(dataSource.isCached('/tasks/2')).to.be.true;
                    expect(dataSource.isCached('/tasks/2/', true)).to.be.false;
                });
            });
        })
    })

    after(function() {
        return TestServer.stop();
    })
})
