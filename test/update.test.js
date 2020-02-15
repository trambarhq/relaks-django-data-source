import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;

describe('Update methods:', function() {
  before(function() {
    return TestServer.start(port);
  })
  describe('#updateOne()', function() {
    describe('(numeric keys)', function() {
      it ('should update an object', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        // omitting trailing slash on purpose
        const object = await dataSource.fetchOne('/tasks/6');
        const changedObject = { ...object, category: 'religion' };
        const updatedObject = await dataSource.updateOne('/tasks/', changedObject);
        expect(updatedObject).to.have.property('category', 'religion');

        // this should be cached
        const cachedObject = await dataSource.fetchOne('/tasks/6');
        expect(cachedObject).to.have.property('category', 'religion');
        expect(cachedObject).to.deep.equal(updatedObject);

        // bypass cache and fetch object directly
        const fetchedObject = await dataSource.get(`${baseURL}/tasks/6`);
        expect(fetchedObject).to.have.property('category', 'religion');
      })
      it ('should fail with status code 404 when object does not exist', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const deletedObject = {
          id: 101
        };
        try {
          const object = await dataSource.updateOne('/tasks/', deletedObject);
          expect.fail();
        } catch (err) {
          expect(err).to.have.property('status', 404);
        }
      })
    })
    describe('(URL keys)', function() {
      before(function() {
        return TestServer.reset({ urlKeys: true });
      })
      it ('should update an object', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const object = await dataSource.fetchOne('/tasks/6');
        const changedObject = { ...object, category: 'religion' };
        const updatedObject = await dataSource.updateOne(changedObject);
        expect(updatedObject).to.have.property('category', 'religion');
      })
    })
  })
  describe('#updateMultiple()', function() {
    before(function() {
      return TestServer.reset();
    })
    it ('should replace objects in list query afterward when "replace" is specified', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { afterUpdate: 'replace' };
      const objects = await dataSource.fetchList('/tasks/', options);
      const changedObjects = objects.slice(0, 5).map((object) => {
        return { ...object, category: 'religion' };
      });
      const updatedObjects = await dataSource.updateMultiple('/tasks/', changedObjects);
      const objectsAfter = await dataSource.fetchList('/tasks/', options);
      expect(objectsAfter.slice(0, 5)).to.eql(changedObjects);
    })
    it ('should not trigger change event when "replace" is specified', async function() {
      const dataSource = new DataSource({ baseURL });
      let changeEvent = null;
      dataSource.activate();
      dataSource.addEventListener('change', (evt) => {
        changeEvent = evt;
      });
      const options = { afterUpdate: 'replace' };
      const objects = await dataSource.fetchList('/tasks/', options);
      const changedObjects = objects.slice(0, 5).map((object) => {
        return { ...object, category: 'religion' };
      });
      await dataSource.updateMultiple('/tasks/', changedObjects);
      expect(changeEvent).to.be.null;
    })
    it ('should trigger refreshing of list query by default', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = await dataSource.fetchList('/tasks/');
      const changedObjects = objects.slice(10, 15).map((object) => {
        return { ...object, category: 'religion' };
      });
      dataSource.updateMultiple('/tasks/', changedObjects);
      await dataSource.waitForEvent('change', 100);

      // trigger the refreshing
      const objectsAfter = await dataSource.fetchList('/tasks/');
      // we shouldn't see any changes yet
      for (let object of objectsAfter.slice(10, 15)) {
        expect(object).to.have.property('category', 'drinking');
      }
      // wait for another change event
      await dataSource.waitForEvent('change', 100);

      const objectsAfterRefresh = await dataSource.fetchList('/tasks/');
      // now the changes show up
      for (let object of objectsAfterRefresh.slice(10, 15)) {
        expect(object).to.have.property('category', 'religion');
      }
    })
    it ('should fail with when one of the objects does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = [
        { id: 100, title: 'Dobchinsky' },
        { id: 101, title: 'Bobchinsky' },
      ];
      try {
        await dataSource.updateMultiple('/tasks/', objects);
      } catch (err) {
        expect(err).to.contain.keys('results', 'errors');
        expect(err.errors[0]).to.be.null;
        expect(err.errors[1]).to.be.instanceof(Error);
        expect(err.results[0]).to.not.be.null;
        expect(err.results[1]).to.be.null;
      }
    })
    it ('should force refresh when an error occurs', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { afterUpdate: 'replace' };
      const objects = await dataSource.fetchList('/tasks/', options);
      const missing = objects[3]
      const present = objects[4];

      // remove object in backend
      await TestServer.remove(missing.id);
      const changedObjects = [ missing, present ];
      dataSource.updateMultiple('/tasks/', changedObjects);
      await dataSource.waitForEvent('change', 100);

      // query is cached but expired
      expect(dataSource.isCached('/tasks/')).to.be.true;
      expect(dataSource.isCached('/tasks/', true)).to.be.false;
    })
  });
  after(function() {
    return TestServer.stop();
  })
})
