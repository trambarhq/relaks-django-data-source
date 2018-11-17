import Chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

Chai.use(ChaiAsPromised);

var port = 7777;
var baseURL = `http://localhost:${port}/api`;
var loginURL = `http://localhost:${port}/login`;
var logoutURL = `http://localhost:${port}/logout`;

describe('Authentication:', function() {
    before(function() {
        return TestServer.start(port, { authentication: true });
    })

    it ('should fail when trying to fetch data without authenticating first', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        dataSource.addEventListener('authentication', (evt) => {
            evt.preventDefault();
        });
        return expect(dataSource.fetchOne(`/tasks/5/`))
            .to.eventually.be.rejectedWith(Error)
            .that.has.property('status', 401);
    })
    it ('should fail when trying to fetch data with bogus authorization token', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        dataSource.addEventListener('authentication', (evt) => {
            dataSource.authorize('bogus');
        });
        debugger;
        return expect(dataSource.fetchOne(`/tasks/5/`))
            .to.eventually.be.rejectedWith(Error)
            .that.has.property('status', 403);
    })
    it ('should succeed when correct credentials are supplied', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        dataSource.addEventListener('authentication', (evt) => {
            var credentials = { username: 'sam', password: 'beer' };
            dataSource.authenticate(loginURL, credentials);
        });
        return expect(dataSource.fetchOne(`/tasks/5/`)).to.eventually.be.fulfilled;
    })
    it ('should fail with incorrect password and succeed with correct one', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        var initialError;
        dataSource.addEventListener('authentication', (evt) => {
            var credentials = { username: 'sam', password: 'incorrect' };
            dataSource.authenticate(loginURL, credentials).catch((err) => {
                initialError = err;

                var credentials = { username: 'sam', password: 'correct' };
                return dataSource.authenticate(loginURL, credentials);
            });
        });
        return expect(dataSource.fetchOne(`/tasks/5/`)).to.eventually.be.fulfilled.then(() => {
                expect(initialError).to.have.property('status', 401);
        });
    })
    it ('should fail when password is incorrect and we cancel authentication', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        var initialError;
        dataSource.addEventListener('authentication', (evt) => {
            var credentials = { username: 'sam', password: 'incorrect' };
            dataSource.authenticate(loginURL, credentials).catch((err) => {
                initialError = err;
                dataSource.cancelAuthentication();
            });
        });
        return expect(dataSource.fetchOne(`/tasks/5/`))
            .to.eventually.be.rejectedWith(Error)
            .that.has.property('status', 401);
    })
    it ('should fail when we cancel authentication right off the bat', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        var initialError;
        dataSource.addEventListener('authentication', (evt) => {
            dataSource.cancelAuthentication();
        });
        return expect(dataSource.fetchOne(`/tasks/5/`))
            .to.eventually.be.rejectedWith(Error)
            .that.has.property('status', 401);
    })
    it ('should emit an authorization event after authentication is successful', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        var authEvent;
        dataSource.addEventListener('authentication', (evt) => {
            var credentials = { username: 'sam', password: 'beer' };
            dataSource.authenticate(loginURL, credentials);
        });
        dataSource.addEventListener('authorization', (evt) => {
            authEvent = evt;
        });
        return expect(dataSource.fetchOne(`/tasks/5/`)).to.eventually.be.fulfilled.then(() => {
            expect(authEvent).to.have.property('token').that.is.not.null;
        });
    })
    it ('should not be able to fetch data after authorization is revoked', function() {
        var dataSource = new DjangoDataSource({ baseURL });
        var noAuth = false;
        dataSource.addEventListener('authentication', (evt) => {
            if (!noAuth) {
                var credentials = { username: 'sam', password: 'beer' };
                dataSource.authenticate(loginURL, credentials);
            } else {
                evt.preventDefault();
            }
        });
        return expect(dataSource.fetchOne(`/tasks/5/`)).to.eventually.be.fulfilled.then(() => {
            return dataSource.revokeAuthorization(logoutURL);
        }).then(() => {
            noAuth = true;
            return expect(dataSource.fetchOne(`/tasks/6/`))
                .to.eventually.be.rejectedWith(Error)
                .that.has.property('status', 401);
        });
    })

    after(function() {
        return TestServer.stop();
    })
})
