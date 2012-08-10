## mongoose-schema-extend

Implements schema inheritance and an optional discriminator key which is useful for storing different types of related documents in a collection and fetching them with the correct model type.

# Usage

Install via NPM

    $ npm install mongoose-schema-extend

# Schema Inheritance

You just require the library to add schema extend method

```javascript
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
  name : String
}, { collection : 'users' });

var EmployeeSchema = PersonSchema.extend({
  department : String
});

var Person = mongoose.model('Person', PersonSchema),
    Employee = mongoose.model('Employee', EmployeeSchema);

var Brian = new Employee({
  name : 'Brian Kirchoff',
  department : 'Engineering'
});

...
```

# Discriminator Key

By adding the discriminatorKey schema option, a key is added to your saved documents with the model name and is used when finding documents of different types to set them to the correct model

```javascript
...
var VehicleSchema = mongoose.Schema({ 
  make : String,
}, { collection : 'vehicles', discriminatorKey : '_type' });

var CarSchema = VehicleSchema.extend({
  year : Number
});
var BusSchema = VehicleSchema.extend({
  route : Number
})

var Vehicle = mongoose.model('vehicle', VehicleSchema),
    Car = mongoose.model('car', CarSchema),
    Bus = mongoose.model('bus', BusSchema);

var accord = new Car({ 
  make : 'Honda',
  year : 1999
});
var muni = new Bus({
  make : 'Neoplan',
  route : 33
});

accord.save(function(err) {
  muni.save(function(err) {
    // vehicles are saved with the _type key set to 'car' and 'bus'
  });
})

```

At this point in MongoDB you will have documents similar to this

    { "_type" : "car", "make" : "Honda", "year" : 1999, "_id" : ObjectId("5024460368368a3007000002"), "__v" : 0 }
    { "_type" : "bus", "make" : "Neoplan", "route" : 33, "_id" : ObjectId("5024460368368a3007000003"), "__v" : 0 }

When querying, the objects model prototype will be set based on the _type field, so they are fully functional

```javascript
Vehicle.find({}, function(err, vehicles) {
  console.log(vehicles[0]); // vehicles[0] instanceof Car === true
  console.log(vehicles[1]); // vehicles[1] instanceof Bus === true
});
```

# Tests

To run the tests install mocha

    npm install mocha -g

and then run

    mocha


