var mongoose = require('mongoose'),
    extend = require('../'),
    should = require('should');

var Schema = mongoose.Schema;

describe('schema extend tests', function() {
  // Schema for tests
  var VehicleSchema = new Schema({
    name : String
  }, { safe : true });
  var Vehicle = mongoose.model('Vehicle', VehicleSchema);

  describe('extending a schema', function() {
    it('should merge keys', function() {
      var CarSchema = VehicleSchema.extend({
        model : String
      });
      should.exist(VehicleSchema.path('name'));
      should.not.exist(VehicleSchema.path('model'));

      should.exist(CarSchema.path('name'));
      should.exist(CarSchema.path('model'));
    });

    it('should override options', function() {
      var CarSchema = VehicleSchema.extend({
        color : String
      }, { safe : false, shardkey: { name : 1 } });

      VehicleSchema.options.safe.should.equal(true);
      should.not.exist(VehicleSchema.options.shardkey);

      CarSchema.options.safe.should.equal(false);
      CarSchema.options.shardkey.should.eql({ name : 1 });
    });
  });
});
