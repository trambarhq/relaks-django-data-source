import Chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import TestServer from './lib/test-server';
import DjangoDataSource from '../index';

Chai.use(ChaiAsPromised);

var port = 7777;
var baseURL = `http://localhost:${port}/api`;
var loginURL = `http://localhost:${port}/login`;

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
            dataSource.authorize(loginURL, 'bogus');
        });
        return expect(dataSource.fetchOne(`/tasks/5/`))
            .to.eventually.be.rejectedWith(Error)
            .that.has.property('status', 403);
    })
    it ('should succeed when trying to fetch data with bogus authorization token', function() {
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

    after(function() {
        return TestServer.stop();
    })
})
