import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;

describe(`Invalidation methods`, function() {
  before(function() {
    return TestServer.start(port, { pagination: true });
  })
  describe('#invalidate()', function() {
    it ('should mark all queries as expired when no criteria are provided', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = await dataSource.fetchOne('/tasks/1/');
      const list = await dataSource.fetchList('/tasks/');
      const result = dataSource.invalidate();
      expect(result).to.be.true;
      expect(dataSource.isCached('/tasks')).to.be.true;
      expect(dataSource.isCached('/tasks', true)).to.be.false;
      expect(dataSource.isCached('/tasks/1')).to.be.true;
      expect(dataSource.isCached('/tasks/1', true)).to.be.false;
      // would derive from list if list isn't expired
      expect(dataSource.isCached('/tasks/2')).to.be.false;
    })
    it ('should mark queries conducted before a given time', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = await dataSource.fetchOne('/tasks/1/');
      const page = await dataSource.fetchPage('/tasks/', 3);
      const time = new Date;
      const result = dataSource.invalidate(time);
      expect(result).to.be.true;
      expect(dataSource.isCached('/tasks')).to.be.true;
      expect(dataSource.isCached('/tasks', true)).to.be.false;
      expect(dataSource.isCached('/tasks/1')).to.be.true;
      expect(dataSource.isCached('/tasks/1', true)).to.be.false;
      expect(dataSource.isCached('/tasks/2')).to.be.false;
    })
    it ('should ignore queries conducted after a given time', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = await dataSource.fetchOne('/tasks/1/');
      const page = await dataSource.fetchPage('/tasks/', 3);
      const time = new Date((new Date).getTime() - 60000);
      const result = dataSource.invalidate(time);
      expect(result).to.be.false;
      expect(dataSource.isCached('/tasks', true)).to.be.true;
      expect(dataSource.isCached('/tasks/1', true)).to.be.true;
    })
    it ('should cause page queries to be removed from cache momentarily', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const page2 = await dataSource.fetchPage('/tasks/', 2);
      const page3 = await dataSource.fetchPage('/tasks/', 3);
      const result = dataSource.invalidate();

      await dataSource.fetchPage('/tasks/', 2);
      const object = page3[0];
      expect(dataSource.isCached(`/tasks/${object.id}`)).to.be.false;
      await new Promise(resolve => setTimeout(resolve, 1500));
      expect(dataSource.isCached(`/tasks/${object.id}`)).to.be.true;
    })
  })
  describe('#invalidateOne()', function() {
    it ('should mark a single object query as expired', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object1 = await dataSource.fetchOne('/tasks/1/');
      const object2 = await dataSource.fetchOne('/tasks/2/');
      // leaving out trailing slash on purpose
      const result = dataSource.invalidateOne('/tasks/1');
      expect(result).to.be.true;
      expect(dataSource.isCached('/tasks/1')).to.be.true;
      expect(dataSource.isCached('/tasks/1/', true)).to.be.false;
      expect(dataSource.isCached('/tasks/2')).to.be.true;
      expect(dataSource.isCached('/tasks/2/', true)).to.be.true;
    })
  })
  describe('#invalidateList()', function() {
    it ('should mark a single list query as expired', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { afterUpdate: 'replace' };
      await dataSource.fetchList('/tasks/', options);
      const result = dataSource.invalidateList('/tasks/', options);
      expect(result).to.be.true;
      expect(dataSource.isCached('/tasks/')).to.be.true;
      expect(dataSource.isCached('/tasks/', true)).to.be.false;
    })
  })
  describe('#invalidatePage()', function() {
    it ('should mark a single page query as expired', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      await dataSource.fetchPage('/tasks/', 2);
      const result1 = dataSource.invalidatePage('/tasks/', 1);
      expect(result1).to.be.false;
      const result2 = dataSource.invalidatePage('/tasks/', 2);
      expect(result2).to.be.true;
      expect(dataSource.isCached('/tasks/')).to.be.true;
      expect(dataSource.isCached('/tasks/', true)).to.be.false;
    })
  })
  describe('#invalidateMultiple()', function() {
    it ('should mark multiple object queries as expired', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      await dataSource.fetchOne('/tasks/1/');
      await dataSource.fetchOne('/tasks/2/');
      const urls = [ '/tasks/1/', '/tasks/2/' ];
      const result = dataSource.invalidateMultiple(urls);
      expect(result).to.be.true;
      expect(dataSource.isCached('/tasks/1')).to.be.true;
      expect(dataSource.isCached('/tasks/1/', true)).to.be.false;
      expect(dataSource.isCached('/tasks/2')).to.be.true;
      expect(dataSource.isCached('/tasks/2/', true)).to.be.false;
    })
  })
  after(function() {
    return TestServer.stop();
  })
})
