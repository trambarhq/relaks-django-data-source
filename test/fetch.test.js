import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;

describe('Fetch methods:', function() {
  before(function() {
    return TestServer.start(port);
  })
  describe('#fetchOne', function() {
    it ('should fetch an object from remote server', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object = await dataSource.fetchOne(`/tasks/5/`);
      expect(object).to.have.property('id', 5);
      expect(object).to.have.property('category', 'drinking');
    })
    it ('should cache an object', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const object1 = await dataSource.fetchOne(`/tasks/6/`);
      const object2 = await dataSource.fetchOne(`/tasks/6/`);
      expect(object2).to.equal(object1);
    })
    it ('should fail with status code 404 when object does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      try {
        const object = await dataSource.fetchOne(`/tasks/555/`);
        expect.fail();
      } catch(err) {
        expect(err).to.have.property('status', 404);
      }
    })
    it ('should invalidate a query by fetchList() when a fresher copy is retrieved', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { minimum: '100%' };
      const objects = await dataSource.fetchList(`/tasks/`, options);
      const object1 = objects[0];
      await TestServer.update(object1.id, { category: 'something' });
      // invalidate fetchOne() query (which gets created automatically)
      expect(dataSource.invalidateOne(`/tasks/${object1.id}`)).to.be.true;
      // trigger refresh and wait for change event
      dataSource.fetchOne(`/tasks/${object1.id}`);
      await dataSource.waitForEvent('change', 100);
      const object = await dataSource.fetchOne(`/tasks/${object1.id}`);
      expect(object).to.have.property('category', 'something');
      expect(dataSource.isCached('/tasks/', true)).to.be.false;
    });
    it ('should replace object in a query by fetchList() when a fresher copy is retrieved', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { minimum: '100%', afterUpdate: 'replace' };
      const objects = await dataSource.fetchList(`/tasks/`, options);
      const object2 = objects[1];
      await TestServer.update(object2.id, { category: 'bingo' });
      // invalidate fetchOne() query (which gets created automatically)
      expect(dataSource.invalidateOne(`/tasks/${object2.id}`)).to.be.true;
      // trigger refresh and wait for change event
      dataSource.fetchOne(`/tasks/${object2.id}`);
      await dataSource.waitForEvent('change', 100);
      const object = await dataSource.fetchOne(`/tasks/${object2.id}`);
      expect(object).to.have.property('category', 'bingo');
      expect(dataSource.isCached('/tasks/', true)).to.be.true;
      const objectsAfter = await dataSource.fetchList(`/tasks/`, options);
      const object2After = objectsAfter[1];
      expect(object2After).to.have.property('category', 'bingo');
    });
    it ('should not proceed until the data source is activated', async function() {
      const dataSource = new DataSource({ baseURL });
      let unpaused = false;
      setTimeout(() => {
        unpaused = true;
        dataSource.activate();
      }, 100);
      await dataSource.fetchOne(`/tasks/5/`);
      expect(unpaused).to.be.true;
    })
  })
  describe('#fetchList', function() {
    describe('(no pagination)', function() {
      before(function() {
        return TestServer.reset();
      })
      it ('should fetch all objects from remote server', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchList(`/tasks/`);
        expect(objects).to.have.length(100);
      })
      it ('should cache objects', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects1 = await dataSource.fetchList(`/tasks/`);
        const objects2 = await dataSource.fetchList(`/tasks/`);
        expect(objects2).to.equal(objects1);
      })
      it ('should cache objects for fetchOne() as well', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchList(`/tasks/`);
        const object1 = objects[3]
        const object2 = await dataSource.fetchOne(`/tasks/${object1.id}/`);
        expect(object2).to.equal(object1);
      })
      it ('should not provide objects to fetchOne() when abbreviated is set', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { abbreviated: true };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        const object1 = objects[3];
        const object2 = await dataSource.fetchOne(`/tasks/${object1.id}/`);
        expect(object2).to.not.equal(object1);
      })
      it ('should return results with dummy more() function and total', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchList(`/tasks/`);
        expect(objects).to.have.property('more').that.is.instanceof(Function);
        expect(objects).to.have.property('total', 100);
      })
      it ('should fail with status code 404 when object type does not exist', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        try {
          await dataSource.fetchList(`/jobs/`);
          expect.fail();
        } catch (err) {
          expect(err).to.have.property('status', 404);
        }
      })
      it ('should update query by fetchOne() when fresher objects are retrieved', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const object = await dataSource.fetchOne(`/tasks/7/`);
        await TestServer.update(object.id, { category: 'dingo' });
        const objects = await dataSource.fetchList(`/tasks`);
        const objectAfter1 = objects.find(obj => obj.id === 7);
        expect(objectAfter1).to.have.property('category', 'dingo');
        expect(dataSource.isCached('/tasks/7/', true)).to.be.true;
        const objectAfter2 =await dataSource.fetchOne(`/tasks/7/`);
        expect(objectAfter2).to.have.property('category', 'dingo');
      })
      it ('should invalidate another query by when fresher objects are retrieved', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: '100%' };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        const object1 = objects[0];
        await TestServer.update(object1.id, { category: 'something' });
        const objectsAfter = await dataSource.fetchList(`/tasks/?sort=1`, options);
        expect(dataSource.isCached('/tasks/', true)).to.be.false;
        expect(dataSource.isCached('/tasks/?sort=1', true)).to.be.true;
      });
    })
    describe('(pagination)', function() {
      before(function() {
        return TestServer.reset({ pagination: true, perPage: 15 });
      })
      it ('should fetch the first page, with more() and total attached to result', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchList(`/tasks/`);
        expect(objects).to.have.length(15);
        expect(objects).to.have.property('more').that.is.instanceof(Function);
        expect(objects).to.have.property('total', 100);
      })
      it ('should trigger a change event, when more() is called', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        let changeEvent;
        dataSource.addEventListener('change', (evt) => {
          changeEvent = evt;
        });
        const objects1 = await dataSource.fetchList(`/tasks/`);
        const objects2 = await objects1.more();
        expect(objects2).to.have.length(30);
        expect(changeEvent).to.be.an('object');

        const objects3 = await dataSource.fetchList(`/tasks/`);
        expect(objects3).to.equal(objects2);
      })
      it ('should fetch enough records to meet minimum requirement', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: 25 };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        expect(objects).to.have.length(30);
      })
      it ('should interpret negative minimum as that amount off the total', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: -25 };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        // 15 * 5 = 100 - 25
        expect(objects).to.have.length(75);
      })
      it ('should handle minimum specified as percentage', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: ' 25% ' };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        // 15 * 2 > 100 * 25%
        expect(objects).to.have.length(30);
      })
      it ('should handle minimum specified as negative percentage', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: ' -20% ' };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        // 15 * 6 > 100 - (100 * 20)%
        expect(objects).to.have.length(90);
      })
      it ('should invalidate another query by when fresher objects are retrieved', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const options = { minimum: '100%' };
        const objects = await dataSource.fetchList(`/tasks/`, options);
        const object1 = objects[0];
        await TestServer.update(object1.id, { category: 'something' });
        await dataSource.fetchList(`/tasks/?sort=1`, options);
        expect(dataSource.isCached('/tasks/', true)).to.be.false;
        expect(dataSource.isCached('/tasks/?sort=1', true)).to.be.true;
      })
    })
    describe('(URL keys)', function() {
      before(function() {
        return TestServer.reset({ pagination: true, urlKeys: true });
      })
      it ('should cache objects for fetchOne() as well', async function() {
        const dataSource = new DataSource({ baseURL });
        dataSource.activate();
        const objects = await dataSource.fetchList(`/tasks/`);
        const object1 = objects[3]
        const object2 = await dataSource.fetchOne(object1.url);
        expect(object2).to.equal(object1);
        expect(object2).to.have.property('url');
      })
    })
  })
  describe('#fetchPage()', function() {
    before(function() {
      return TestServer.reset({ pagination: true, perPage: 20 });
    })
    it ('should fetch the first page, with total attached to result', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = await dataSource.fetchPage(`/tasks/`, 1);
      expect(objects).to.have.length(20);
      expect(objects).to.have.property('total', 100);
    })
    it ('should fetch the second page', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = await dataSource.fetchPage(`/tasks/`, 2);
      expect(objects).to.have.length(20);
      expect(objects[0]).to.have.property('id', 21);
    })
    it ('should cache objects', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects1 = await dataSource.fetchPage(`/tasks/`, 2);
      const objects2 = await dataSource.fetchPage(`/tasks/`, 2);
      expect(objects2).to.equal(objects1);
    })
    it ('should cache objects for fetchOne() as well', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const objects = await dataSource.fetchPage(`/tasks/`, 3);
      const object1 = objects[3]
      const object2 = await dataSource.fetchOne(`/tasks/${object1.id}/`);
      expect(object2).to.equal(object1);
    })
    it ('should not provide objects to fetchOne() when abbreviated is set', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const options = { abbreviated: true };
      const objects = await dataSource.fetchPage(`/tasks/`, 3, options);
      const object1 = objects[3]
      const object2 = await dataSource.fetchOne(`/tasks/${object1.id}/`);
      expect(object2).to.not.equal(object1);
    })
    it ('should fail with status code 404 when object type does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      try {
        await dataSource.fetchList(`/jobs/`);
        expect.fail();
      } catch (err) {
        expect(err).to.have.property('status', 404);
      }
    })
  })
  describe('#fetchMultiple()', function() {
    before(function() {
      return TestServer.reset();
    })
    it ('should fetch multiple objects', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const urls = [];
      for (let i = 1; i <= 20; i += 2) {
        urls.push(`/tasks/${i}`);
      }
      const objects = await dataSource.fetchMultiple(urls);
      expect(objects).to.have.length(10);
    })
    it ('should return partial results when the number meet the mimimum specified', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const urls1 = [];
      for (let i = 1; i <= 20; i += 2) {
        urls1.push(`/tasks/${i}`);
      }
      const objects1 = await dataSource.fetchMultiple(urls1);
      const urls2 = [];
      for (let i = 1; i <= 20; i += 1) {
        urls2.push(`/tasks/${i}`);
      }
      const options = { minimum: '50%' };
      const objects2 = await dataSource.fetchMultiple(urls2, options);
      expect(objects2).to.have.length(20);
      expect(objects2.filter(Boolean)).to.have.length(10);
      expect(objects2[1]).to.be.null;
    })
    it ('should trigger change event once full list becomes available', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const urls1 = [];
      for (let i = 1; i <= 20; i += 2) {
        urls1.push(`/tasks/${i}`);
      }
      const objects1 = await dataSource.fetchMultiple(urls1);
      const urls2 = [];
      for (let i = 1; i <= 20; i += 1) {
        urls2.push(`/tasks/${i}`);
      }
      const options = { minimum: '50%' };
      const objects2 = await dataSource.fetchMultiple(urls2, options);
      // only got half the list
      expect(objects2.filter(Boolean)).to.have.length(10);
      await dataSource.waitForEvent('change', 100);
      const objects3 = await dataSource.fetchMultiple(urls2, options);
      // all objects should be there
      expect(objects3.filter(Boolean)).to.have.length(20);
    })
    it ('should fail with when one of the objects does not exist', async function() {
      const dataSource = new DataSource({ baseURL });
      dataSource.activate();
      const urls = [
        `/tasks/99`,
        `/tasks/100`,
        `/tasks/101`,
      ];
      try {
        await dataSource.fetchMultiple(urls);
        expect.fail();
      } catch (err) {
        expect(err).to.contains.keys('results', 'errors');
      }
    })
  })
  after(function() {
    return TestServer.stop();
  })
})
