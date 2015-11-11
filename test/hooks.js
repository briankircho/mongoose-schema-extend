'use strict';

var extend = require('../');

var chai = require('chai').Should(),
    expect = require('chai').expect;

var fixtures = require('./fixtures');

describe('Hook test', function () {
  it('All pre middleware should execute', (done) => {
    var x = false, y = false;
    var xfirst = false;

    fixtures.VehicleSchema.pre('save', (next) => {
        x = true;
        if(!y) { xfirst = true };
        next();
    });

    fixtures.VeridianDynamicsSchema.pre('save', (next) => {
        y = true;
        next();
    });

    var veridian = new fixtures.VeridianDynamics({
      year : 1986,
      model : 'veridian'
    });

    veridian.save(() => {
      x.should.be.true;
      y.should.be.true;
      done();
    });
  });
});
