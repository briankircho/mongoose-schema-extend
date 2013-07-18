var mongoose = require('mongoose'),
    extend = require('../'),
    should = require('should');

var Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mongoose-schema-extend');

describe('schema discriminator key tests', function() {
  // Schemas for tests
  var VehicleSchema = mongoose.Schema({
    make : String,
  }, { collection : 'vehicles', discriminatorKey : '_type' });
  var SeatSchema = mongoose.Schema({
    _id : String,
    isRecliner : Boolean,
  });
  var CarSchema = VehicleSchema.extend({
    year : Number
  });
  var BusSchema = VehicleSchema.extend({
    route : Number,
    seats : [SeatSchema]
  });

  // Models for tests
  var Vehicle = mongoose.model('vehicle', VehicleSchema),
    Car = mongoose.model('car', CarSchema),
    Bus = mongoose.model('bus', BusSchema);

  // Cleanup the test collection
  beforeEach(function(done) {
    Vehicle.remove({}, function(err) {
      should.not.exist(err);
      done();
    });
  });

  describe('saving documents', function() {
    it('should add the correct type field', function(done) {
      var accord = new Car({
        make : 'Honda',
        year : 2006
      });
      accord.save(function(err) {
        should.not.exist(err);
        accord._type.should.equal('car');
        done();
      });
    });
  });

  describe('finding documents', function() {
    it('should return documents with the correct model', function(done) {
      var accord = new Car({
        make : 'Honda',
        year : 1999
      });
      var muni = new Bus({
        make : 'Neoplan',
        route : 33,
        seats : [
          {
            _id : '1A',
            isRecliner : true,
          },
          {
            _id : '33D',
            isRecliner : false,
          }
        ],
      });
      accord.save(function(err) {
        should.not.exist(err);
        muni.save(function(err) {
          should.not.exist(err);
          Vehicle.find({}, function(err, vehicles) {
            should.not.exist(err);

            vehicles.length.should.equal(2);

            vehicles[0].make.should.equal('Honda');
            vehicles[0].year.should.equal(1999);
            vehicles[0].should.instanceof(Car);

            vehicles[1].make.should.equal('Neoplan');
            vehicles[1].route.should.equal(33);
            vehicles[1].should.instanceof(Bus);

            // Tests that seats is a DocumentArray
            vehicles[1].seats.id('1A').isRecliner.should.be.true;
            vehicles[1].seats.id('33D').isRecliner.should.be.false

            done();
          });
        });
      });
    });
  });
});
