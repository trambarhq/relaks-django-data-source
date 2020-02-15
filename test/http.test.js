import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const testURL = `http://localhost:${port}/test`;

describe('Basic HTTP operations:', function() {
  before(function() {
    return TestServer.start(port);
  })
  describe('#get()', function() {
    it ('should be able to perform a GET request', async function() {
      const dataSource = new DataSource;
      dataSource.activate();
      const response = await dataSource.get(testURL);
      expect(response).to.have.property('status', 'ok');
    })
  })
  describe('#post()', function() {
    it ('should be able to perform a POST request', async function() {
      const dataSource = new DataSource;
      dataSource.activate();
      const response = await dataSource.post(testURL, {});
      expect(response).to.have.property('status', 'ok');
    })
  })
  describe('#put()', function() {
    it ('should be able to perform a PUT request', async function() {
      const dataSource = new DataSource;
      dataSource.activate();
      const response = await dataSource.put(testURL, {});
      expect(response).to.have.property('status', 'ok');
    })
  })
  describe('#delete()', function() {
    it ('should be able to perform a DELETE request', async function() {
      const dataSource = new DataSource;
      dataSource.activate();
      const response = await dataSource.delete(testURL, {});
      expect(response).to.have.property('status', 'ok');
    })
  })
  after(function() {
    return TestServer.stop();
  })
})
