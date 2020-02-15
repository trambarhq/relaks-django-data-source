import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;

describe('Insert methods:', function() {
  before(function() {
    return TestServer.start(port);
  })
  describe('#insertOne()', function() {
    it ('should insert an object into remote database', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = {
        title: 'Meet attractive women',
        description: 'In order to better understand quantum mechanics',
        category: 'social',
      };
      const insertedObject = await dataSource.insertOne('/tasks/', object);
      expect(insertedObject).to.have.property('id', 101)
      expect(insertedObject).to.have.property('category', 'social');

      // bypass cache and fetch object directly
      const fetchedObject = await dataSource.get(`${baseURL}/tasks/101/`);
      expect(fetchedObject).to.have.property('category', 'social');
    })
    it ('should fail with status code 404 when object type does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = {
        title: 'Date attractive women',
        description: 'To enhance the quality of business software',
        category: 'analytic',
      };
      try {
        await dataSource.insertOne('/jobs/', object);
        expect.fail();
      } catch (err) {
        expect(err).to.have.property('status', 404);
      }
    })
  })
  describe('#insertMultiple()', function() {
    before(function() {
      return TestServer.reset();
    })
    it ('should append objects to existing query', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { afterInsert: 'push' };
      await dataSource.fetchList('/tasks/', options);
      const newObjects = [
        {
          title: 'Meet attractive women',
          description: 'In order to better understand quantum mechanics',
          category: 'social',
        },
        {
          title: 'Seduce attractive women',
          description: 'To unlock mysteries concerning violations of time reserval symmetry',
          category: 'physics',
        }
      ];
      await dataSource.insertMultiple('/tasks/', newObjects);
      const objects = await dataSource.fetchList('/tasks/', options);
      expect(objects).to.have.length(102);
      expect(objects[100]).to.have.property('category', 'social');
      expect(objects[101]).to.have.property('category', 'physics');
    })
    it ('should prepend objects to existing query', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { afterInsert: 'unshift' };
      await dataSource.fetchList('/tasks/', options);
      const newObjects = [
        {
          title: 'Meet attractive women',
          description: 'In order to better understand quantum mechanics',
          category: 'social',
        },
        {
          title: 'Seduce attractive women',
          description: 'To unlock mysteries concerning violations of time reserval symmetry',
          category: 'physics',
        }
      ];
      await dataSource.insertMultiple('/tasks/', newObjects);
      const objects = await dataSource.fetchList('/tasks/', options);
      expect(objects[1]).to.have.property('category', 'social');
      expect(objects[0]).to.have.property('category', 'physics');
    })
    it ('should trigger refreshing of list query by default', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      await dataSource.fetchList('/tasks/');

      const newObjects = [
        {
          title: 'Eat cake',
          description: '\'Cause there is no bread',
          category: 'eating',
        },
      ];
      dataSource.insertMultiple('/tasks/', newObjects);
      await dataSource.waitForEvent('change', 100);

      // trigger the refreshing
      const objectsAfter = await dataSource.fetchList('/tasks/')
      // we shouldn't see any changes yet
      for (let object of objectsAfter) {
        expect(object).to.not.have.property('category', 'eating');
      }
      // wait for another change event (when data has been retrieved from server)
      await dataSource.waitForEvent('change', 100);

      const objectsAfterRefresh = await dataSource.fetchList('/tasks/');
      // now the changes show up
      const object = objectsAfterRefresh[objectsAfterRefresh.length - 1];
      expect(object).to.have.property('category', 'eating');
    })
  })
  after(function() {
    return TestServer.stop();
  })
})
