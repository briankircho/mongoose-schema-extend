"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function extend(obj, source, options) {
    // Deep clone the existing schema so we can add without changing it
    var newSchema = lodash_1.cloneDeep(source);
    newSchema._callQueue = [];
    newSchema.callQueue = new Proxy(newSchema._callQueue, {
        get: function (target, property) {
            switch (property) {
                case 'length':
                    return target.length + source.callQueue.length;
                case 'toJSON':
                    return () => target.concat(source.callQueue);
                case 'push':
                    return (e) => target.push(e);
                case 'reduce':
                    return Array.prototype.reduce.bind(target.concat(source.callQueue));
                default:
                    if (typeof property !== 'symbol' && typeof property === 'number' && isNaN(property)) {
                        return target[property];
                    }
                    else {
                        return source.callQueue.concat(target)[property];
                    }
            }
        }
    });
    // Fix validators RegExps
    Object.keys(source.paths).forEach(function (k) {
        source.paths[k].validators.forEach(function (validator, index) {
            if (validator.validator instanceof RegExp) {
                newSchema.paths[k].validators[index].validator = validator.validator;
            }
            if (validator.regexp instanceof RegExp) {
                newSchema.paths[k].validators[index].regexp = validator.regexp;
            }
        });
    }, source);
    // Override the existing options with any newly supplied ones
    for (var k in options) {
        newSchema.options[k] = options[k];
    }
    // Change the unique fields to compound discriminator/field unique indexes
    // using a 2dSphere [HACK ALERT] to allow duplicates or missing fields on subSchemas where
    // the option has not been specified
    var uniqueFields = [];
    for (var k in obj) {
        if (obj[k].unique) {
            obj[k].unique = false;
            uniqueFields.push(k);
        }
    }
    uniqueFields.forEach(function (field) {
        obj[field + '_unique'] = {
            type: { type: String, enum: "Point", default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        };
        var index = {};
        index[newSchema.options.discriminatorKey] = 1;
        index[field] = 1;
        index[field + '_unique'] = '2dsphere';
        newSchema.index(index, { unique: true });
    });
    // This adds all the new schema fields
    newSchema.add(obj);
    var key = newSchema.options.discriminatorKey;
    if (key) {
        // If a discriminatorField is in the schema options, add a new field to store model names
        var discriminatorField = {};
        discriminatorField[key] = { type: String };
        newSchema.add(discriminatorField);
        // When new documents are saved, include the model name in the discriminatorField
        // if it is not set already.
        newSchema.pre('save', function (next) {
            if (this[key] === null || this[key] === undefined) {
                this[key] = this.constructor.modelName;
            }
            next();
        });
    }
    return newSchema;
}
exports.extend = extend;
;
//# sourceMappingURL=index.js.map