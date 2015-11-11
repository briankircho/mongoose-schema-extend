'use strict';

var mongoose = require('mongoose'),
    extend = require('../../');

var VehicleSchema = mongoose.Schema({
  year : { type: Number, trim: true }
}, { collection : 'vehicles', discriminatorKey : '_type' });

var FordSchema = VehicleSchema.extend({
  year : { type: Number, trim: true, required: true },
  model: { type: String, trim: true, unique: true, required: true }
});

var HondaSchema = VehicleSchema.extend({
  model: { type: String, trim: true, unique: true, required: true }
});

// This brand allows two different models to be named the same for commertial obscure purposes
var VeridianDynamicsSchema = VehicleSchema.extend({
  model: { type: String, trim: true, required: true, unique: false }
});

var Vehicle = mongoose.model('vehicle2', VehicleSchema),
  Ford = mongoose.model('ford', FordSchema),
  Honda = mongoose.model('honda', HondaSchema),
  VeridianDynamics = mongoose.model('veridianDynamics', VeridianDynamicsSchema);


module.exports = {
  VehicleSchema: VehicleSchema,
  Vehicle: Vehicle,
  FordSchema: FordSchema,
  Ford: Ford,
  HondaSchema: HondaSchema,
  Honda: Honda,
  VeridianDynamicsSchema: VeridianDynamicsSchema,
  VeridianDynamics: VeridianDynamics
};
