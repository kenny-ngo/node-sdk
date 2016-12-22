'use strict';
var expect = require('chai').use(require('dirty-chai')).expect;
var nock = require('nock');
var Vehicle = require('../lib/vehicle');

var VALID_TOKEN = 'valid-token';
var VALID_AUTHORIZATION = 'Bearer ' + VALID_TOKEN;
var VALID_VID = 'valid-vid';

suite('Vehicle', function() {

  var vehicle = new Vehicle(VALID_VID, VALID_TOKEN);

  suiteSetup(function() {

    var apiNock = nock('https://api.smartcar.com/v1.0');

    apiNock
    .matchHeader('Authorization', VALID_AUTHORIZATION)
    .delete('/vehicles/' + VALID_VID + '/application')
    .reply(200, {
      status: 'success',
    });

    apiNock
    .matchHeader('Authorization', VALID_AUTHORIZATION)
    .get('/vehicles/' + VALID_VID + '/permissions')
    .reply(200, {
      permissions: ['permission1', 'permission2', 'permission3'],
    });

    apiNock
    .matchHeader('Authorization', VALID_AUTHORIZATION)
    .get('/vehicles/' + VALID_VID + '/permissions')
    .query({
      limit: 1,
    })
    .reply(200, {
      permissions: ['permission1'],
    });

  });

  suiteTeardown(function() {
    nock.cleanAll();
  });

  test('switch unit system to imperial', function() {
    vehicle.setUnitsToImperial();
    expect(vehicle.unitSystem).to.equal('imperial');
  });

  test('switch unit system to metric', function() {
    vehicle.setUnitsToMetric();
    expect(vehicle.unitSystem).to.equal('metric');
  });

  test('vehicle constructor defaults to metric unit', function() {
    var metricVehicle = new Vehicle(VALID_VID, VALID_TOKEN);
    expect(metricVehicle.unitSystem).to.equal('metric');
  });

  test('vehicle constructor throws error on bad unit param', function() {
    try {
      var badUnitVehicle = new Vehicle(VALID_VID, VALID_TOKEN, 'not a unit');
    } catch (e) {
      expect(badUnitVehicle).to.not.exist; // eslint-disable-line
      expect(e.message).to.contain('unit');
    }

  });

  test('disconnect', function() {
    return vehicle.disconnect()
    .then(function(response) {
      expect(response.status).to.equal('success');
    });
  });

  test('permissions without paging', function() {
    return vehicle.permissions()
    .then(function(response) {
      expect(response).to.have.all.keys('permissions');
      expect(response.permissions).to.have.lengthOf(3);
    });
  });

  test('permissions with paging', function() {
    return vehicle.permissions({
      limit: 1,
    })
    .then(function(response) {
      expect(response).to.have.all.keys('permissions');
      expect(response.permissions).to.have.lengthOf(1);
    });
  });
});
