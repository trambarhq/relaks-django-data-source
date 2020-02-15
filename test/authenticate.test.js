import { expect } from 'chai';
import TestServer from './lib/test-server.js';
import DataSource from '../src/index.mjs';

const port = 7777;
const baseURL = `http://localhost:${port}/api`;
const loginURL = `http://localhost:${port}/login`;
const logoutURL = `http://localhost:${port}/logout`;

describe('Authentication:', function() {
  before(function() {
    return TestServer.start(port, { authentication: true });
  })
  it ('should fail when trying to fetch data without authenticating first', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    dataSource.addEventListener('authentication', (evt) => {
      evt.preventDefault();
    });
    try {
      await dataSource.fetchOne(`/tasks/5/`);
      expect.fail();
    } catch (err) {
      expect(err).to.have.property('status', 401);
    }
  })
  it ('should fail when trying to fetch data with bogus authorization token', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    dataSource.addEventListener('authentication', (evt) => {
      dataSource.authorize('bogus');
    });
    try {
      await dataSource.fetchOne(`/tasks/5/`);
      expect.fail();
    } catch (err) {
      expect(err).to.have.property('status', 403);
    }
  })
  it ('should succeed when correct credentials are supplied', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    dataSource.addEventListener('authentication', (evt) => {
      const credentials = { username: 'sam', password: 'beer' };
      dataSource.authenticate(loginURL, credentials);
    });

    await dataSource.fetchOne(`/tasks/5/`);
    expect(dataSource.isAuthorized()).to.be.true;
  })
  it ('should fail with incorrect password and succeed with correct one', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    let initialError;
    dataSource.addEventListener('authentication', async (evt) => {
      try {
        const credentials1 = { username: 'sam', password: 'incorrect' };
        await dataSource.authenticate(loginURL, credentials1);
      } catch(err) {
        initialError = err;

        const credentials2 = { username: 'sam', password: 'correct' };
        await dataSource.authenticate(loginURL, credentials2);
      }
    });
    await dataSource.fetchOne(`/tasks/5/`);
    expect(initialError).to.have.property('status', 401);
  })
  it ('should fail when password is incorrect and we cancel authentication', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    let initialError;
    dataSource.addEventListener('authentication', async (evt) => {
      try {
        const credentials = { username: 'sam', password: 'incorrect' };
        await dataSource.authenticate(loginURL, credentials);
      } catch(err) {
        initialError = err;
        dataSource.cancelAuthentication();
      }
    });
    try {
      await dataSource.fetchOne(`/tasks/5/`);
      expect.fail();
    } catch (err) {
      expect(err).to.have.property('status', 401);
    }
  })
  it ('should fail when we cancel authentication right off the bat', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    dataSource.addEventListener('authentication', (evt) => {
      dataSource.cancelAuthentication();
    });
    try {
      await dataSource.fetchOne(`/tasks/5/`);
      expect.fail();
    } catch (err) {
      expect(err).to.have.property('status', 401);
    }
  })
  it ('should emit an authorization event after authentication is successful', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    let authEvent;
    dataSource.addEventListener('authentication', (evt) => {
      const credentials = { username: 'sam', password: 'beer' };
      dataSource.authenticate(loginURL, credentials);
    });
    dataSource.addEventListener('authorization', (evt) => {
      authEvent = evt;
    });
    await dataSource.fetchOne(`/tasks/5/`);
    expect(authEvent).to.have.property('token').that.is.not.null;
  })
  it ('should not be able to fetch data after authorization is revoked', async function() {
    const dataSource = new DataSource({ baseURL });
    dataSource.activate();
    let noAuth = false;
    dataSource.addEventListener('authentication', (evt) => {
      if (!noAuth) {
        const credentials = { username: 'sam', password: 'beer' };
        dataSource.authenticate(loginURL, credentials);
      } else {
        evt.preventDefault();
      }
    });
    await dataSource.fetchOne(`/tasks/5/`);
    await dataSource.revokeAuthorization(logoutURL);
    noAuth = true;
    try {
      await dataSource.fetchOne(`/tasks/6/`);
      expect.fail();
    } catch (err) {
      expect(err).to.have.property('status', 401);
    }
  })
  after(function() {
    return TestServer.stop();
  })
})
