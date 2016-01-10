'use strict';

var mongoose = require('mongoose'),
    should = require('should');

var Schema = mongoose.Schema,
    fixtures = require('./fixtures');

describe('schema discriminator key tests', function() {
  beforeEach(function(done) {
    fixtures.Vehicle.remove({}, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('Should allow two different brand vehicles with the same model', function (done) {
    var fordSierra = new fixtures.Ford({
      year : 1986,
      model : 'sierra'
    });

    var hondaSierra = new fixtures.Honda({
      year : 2030,
      model : 'sierra'
    });

    fordSierra.save(function(err) {
      should.not.exist(err);
      fordSierra._type.should.equal('ford');

      hondaSierra.save(function(err) {
        should.not.exist(err);
        hondaSierra._type.should.equal('honda');
        done();
      })
    });
  });

  it('Should not allow two vehicles of the same brand with the same model', function (done) {
    var fordSierra = new fixtures.Ford({
      year : 1986,
      model : 'sierra'
    });

    var anotherFordSierra = new fixtures.Ford({
      year : 2030,
      model : 'sierra'
    });

    fordSierra.save(function(err) {
      should.not.exist(err);
      fordSierra._type.should.equal('ford');

      anotherFordSierra.save(function(err) {
        should.exist(err);
        done();
      })
    });
  });

  it('Should allow two vehicles of the same brand with different model', function (done) {
    var fordSierra = new fixtures.Ford({
      year : 1986,
      model : 'sierra'
    });

    var anotherFordSierra = new fixtures.Ford({
      year : 2030,
      model : 'planet'
    });

    fordSierra.save(function(err) {
      should.not.exist(err);
      fordSierra._type.should.equal('ford');

      anotherFordSierra.save(function(err) {
        should.not.exist(err);
        done();
      })
    });
  });

  it('Should allow two vehicles of the same obscure brand with the same model', function (done) {
    var fordSierra = new fixtures.Ford({
      year : 1986,
      model : 'sierra'
    });

    var veridianDynamics1 = new fixtures.VeridianDynamics({
      year : 1986,
      model : 'sierra'
    });

    var veridianDynamics2 = new fixtures.VeridianDynamics({
      year : 2030,
      model : 'sierra'
    });

    fordSierra.save(function(err) {
      should.not.exist(err);
      veridianDynamics1.save(function(err) {
        should.not.exist(err);
        veridianDynamics1._type.should.equal('veridianDynamics');

        veridianDynamics2.save(function(err) {
          should.not.exist(err);
          veridianDynamics2._type.should.equal('veridianDynamics');
          done();
        })
      });
    });
  });

  it('Should not allow to insert objects without a required field', function(done) {
    var fordSierra = new fixtures.Ford({
      model : 'sierramorena'
    });

    fordSierra.save(function(err, data) {
      should.exist(err);
      done();
    });
  });

  it('Should allow to insert objects without a field that\'s required by a sibling schema', function(done) {
    var fordSierra = new fixtures.Ford({
      model : 'sierra'
    });

    var veridianDynamics1 = new fixtures.VeridianDynamics({
      model : 'sierra'
    });

    fordSierra.save(function(err) {
      should.exist(err);
      veridianDynamics1.save(function(err) {
        should.not.exist(err);
        veridianDynamics1._type.should.equal('veridianDynamics');
        done();
      });
    });
  });

  //TODO test two children with same attribute names and different validators
  //TODO test child with regexp
});
