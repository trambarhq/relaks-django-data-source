import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;

describe('Delete methods:', function() {
  before(function() {
    return TestServer.start(port);
  })
  describe('#deleteOne()', function() {
    describe('(numeric keys)', function() {
      it ('should delete an object', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const object = await dataSource.fetchOne('/tasks/55');
        await dataSource.deleteOne('/tasks/', object);
        const objects = await dataSource.fetchList('/tasks/');
        expect(objects).to.have.length(99);
        const result = objects.find(object => object.id === 55);
        expect(result).to.be.undefined;
      })
      it ('should fail with status code 404 when object does not exist', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const deletedObject = {
          id: 101
        };
        try {
          await dataSource.deleteOne('/tasks/', deletedObject);
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
      it ('should delete an object', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const object = await dataSource.fetchOne('/tasks/55');
        await dataSource.deleteOne(object);
        const objects = await dataSource.fetchList('/tasks/');
        expect(objects).to.have.length(99);
        const result = objects.find(object => object.id === 55);
        expect(result).to.be.undefined;
      })
    })
  })
  describe('#deleteMultiple()', function() {
    before(function() {
      return TestServer.reset();
    })
    it ('should remove objects from list query by default', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = await dataSource.fetchList('/tasks/');
      const slice = objects.slice(0, 5);
      const deletedObjects = await dataSource.deleteMultiple('/tasks/', slice);
      expect(deletedObjects).to.have.length(5);
      const objectsAfter = await dataSource.fetchList('/tasks/');
      for (let deletedObject of deletedObjects) {
        const found = objectsAfter.find(object => object.id === deletedObject.id);
        expect(found).to.be.undefined;
      }
    })
    it ('should remove object query', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const urls = [ '/tasks/99', '/tasks/100' ];
      const objects = await dataSource.fetchMultiple(urls);
      expect(objects).to.have.length(2);
      const deletedObjects = await dataSource.deleteMultiple('/tasks/', objects);
      expect(deletedObjects).to.have.length(2);
      try {
        await dataSource.fetchOne(urls[0]);
        expect.fail();
      } catch (err) {
        expect(err).to.have.property('status', 404);
      }
    })
    it ('should run custom hook function', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = {
        afterDelete: (objects, deletedObjects) => {
          return objects.map((object) => {
            const deletedObject = deletedObjects.find((deletedObject) => {
              return (deletedObject.id === object.id);
            });
            if (deletedObject) {
              deletedObject.deleted = true;
              return deletedObject;
            } else {
              return object;
            }
          });
        }
      };
      const objects = await dataSource.fetchList('/tasks/', options);
      const slice = objects.slice(0, 5);
      const deletedObjects = await dataSource.deleteMultiple('/tasks/', slice);
      const objectsAfter = await dataSource.fetchList('/tasks/', options);
      for (let object of objectsAfter.slice(0, 5)) {
        expect(object).to.have.property('deleted', true);
      }
    })
    it ('should not fire change event when query has "ignore" as hook', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = {
        afterDelete: 'ignore'
      };
      const objects = await dataSource.fetchList('/tasks/', options);
      try {
        const slice = objects.slice(0, 5);
        dataSource.deleteMultiple('/tasks/', slice);
        await dataSource.waitForEvent('change', 100);
        expect.fail('unexpected change event');
      } catch (err) {
      }
    })
    it ('should fail with when one of the objects does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = [
        { id: 50 },
        { id: 501 },
      ];
      try {
        await dataSource.deleteMultiple('/tasks/', objects);
        expect.fail();
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
      const objects = await dataSource.fetchList('/tasks/');
      const missing = objects[3]
      const present = objects[4];
      // remove object in backend
      await TestServer.remove(missing.id);
      dataSource.deleteMultiple('/tasks/', [ missing, present ]);
      await dataSource.waitForEvent('change', 100);
      // query should be cached but expired
      expect(dataSource.isCached('/tasks/')).to.be.true;
      expect(dataSource.isCached('/tasks/', true)).to.be.false;
    })
    describe('(pagination)', function() {
      before(function() {
        return TestServer.reset({ pagination: true });
      })
      it ('should force page query to refresh by default', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchPage('/tasks/', 2);
        const deletedObjects = objects.slice(0, 5);
        dataSource.deleteMultiple('/tasks/', deletedObjects);
        await dataSource.waitForEvent('change', 100);

        // trigger the refreshing
        dataSource.fetchPage('/tasks/', 2);
        // wait for another change event (after list is refreshed)
        await dataSource.waitForEvent('change', 100);

        const objectsAfterRefresh = await dataSource.fetchPage('/tasks/', 2);
        for (let deletedObject of deletedObjects) {
          const found = objectsAfterRefresh.find(object => object.id === deletedObject.id);
          expect(found).to.be.undefined;
        }
      })
    })
  })
  after(function() {
    return TestServer.stop();
  })
})
