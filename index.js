'use strict';

var mongoose = require('mongoose'),
    owl = require('owl-deepcopy');

var Schema = mongoose.Schema,
    Model = mongoose.Model;

var Reflect = require('harmony-reflect');

/**
 * Add a new function to the schema prototype to create a new schema by extending an existing one
 */
Schema.prototype.extend = function(obj, options) {
  // Deep clone the existing schema so we can add without changing it
  var newSchema = owl.deepCopy(this);

  newSchema._callQueue = [];

  var that = this;

  newSchema.callQueue = new Proxy(newSchema._callQueue, {
    get: function(target, property, receiver) {
      switch (property) {
      case 'length':
        return target.length + that.callQueue.length;
      case 'toJSON':
        return () => target.concat(that.callQueue);
      case 'push':
        return (e) => target.push(e);
        break;
      case 'reduce':
        return Array.prototype.reduce.bind(target.concat(that.callQueue));
      default:
        if(isNaN(property)) {
          return target[property];
        } else {
          return that.callQueue.concat(target)[property];
        }
      }
    }
  });

  // Fix validators RegExps
  Object.keys(this.paths).forEach(function(k) {
    this.paths[k].validators.forEach(function (validator, index) {
        if (validator.validator instanceof RegExp) {
            newSchema.paths[k].validators[index].validator = validator.validator;
        }
    });
  }, this);

  // Override the existing options with any newly supplied ones
  for(var k in options) {
    newSchema.options[k] = options[k];
  }

  // Change the unique fields to compound discriminator/field unique indexes
  // using a 2dSphere [HACK ALERT] to allow duplicates or missing fields on subSchemas where
  // the option has not been specified
  var uniqueFields = [];

  for(var k in obj) {
    if(obj[k].unique) {
      obj[k].unique = false;
      uniqueFields.push(k);
    }
  }

  uniqueFields.forEach(function (field) {
    obj[field + '_unique'] = { type: {type: String, enum: "Point", default: "Point"}, coordinates: { type: [Number], default: [0,0] } };

    var index = {};
    index[newSchema.options.discriminatorKey] = 1;
    index[field] = 1;
    index[field + '_unique'] = '2dsphere';
    newSchema.index(index, { unique: true });
  });

  // This adds all the new schema fields
  newSchema.add(obj);

  var key = newSchema.options.discriminatorKey;
  if(key) {
    // If a discriminatorField is in the schema options, add a new field to store model names
    var discriminatorField = {};
    discriminatorField[key] = { type : String };
    newSchema.add(discriminatorField);

    // When new documents are saved, include the model name in the discriminatorField
    // if it is not set already.
    newSchema.pre('save', function(next) {
      if(this[key] === null || this[key] === undefined) {
        this[key] = this.constructor.modelName;
      }
      next();
    });
  }

  return newSchema;
};

/**
 * Wrap the model init to set the prototype based on the discriminator field
 */
var _init = Model.prototype.init;
Model.prototype.init = function(doc, query, fn) {
  var key = this.schema.options['discriminatorKey'];
  if(key) {

    // If the discriminatorField contains a model name, we set the documents prototype to that model
    var type = doc[key];
    if(type) {
      // this will throw exception if the model isn't registered
      var model = this.db.model(type);
      var newFn = function() {
        // this is pretty ugly, but we need to run the code below before the callback
        process.nextTick(function() {
          if(fn && typeof fn === 'function') fn.apply(this, arguments);
        });
      }
      var modelInstance = new model();
      this.schema = model.schema;
      var obj = _init.call(this, doc, query, newFn);
      obj.__proto__ = model.prototype;
      return obj;
    }
  }

  // If theres no discriminatorKey we can just call the original method
  return _init.apply(this, arguments);
}
