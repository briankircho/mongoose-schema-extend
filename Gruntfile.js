'use strict';

var glob = require('glob');

var exclude = ['.git', 'node_modules','bower_components','sample-module'];
var files = glob.sync("**/test/**/*.js", {});

files = files.filter(function(path) {
  return exclude.every(function(regexp) {
    return path.match(regexp) === null;
  });
});

/**
 * Sort a list of paths
 */
function pathsort(paths, sep, algorithm) {
  sep = sep || '/'

  return paths.map(function(el) {
    return el.split(sep)
  }).sort(algorithm || levelSorter).map(function(el) {
    return el.join(sep)
  })
}

/**
 * Level-order sort of a list of paths
 */
function levelSorter(a, b) {
  var l = Math.max(a.length, b.length)
  for (var i = 0; i < l; i += 1) {
    if (!(i in a)) return +1
    if (!(i in b)) return -1

    if (a.length < b.length) return +1
    if (a.length > b.length) return -1
  }
}

files = pathsort(files);


module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
        },
        src: files
      }
    }
  });

  grunt.registerTask('drop', 'drop the database', function() {
    var mongoose = require('mongoose');

    // async mode
    var done = this.async();

    mongoose.connection.once('open', function () {
      mongoose.connection.db.dropDatabase(function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log('Successfully dropped db');
        }
        mongoose.connection.close(done);
      });
    });

    mongoose.connect('mongodb://localhost:27017/mongoose-extend');
  });

  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ['drop', 'mochaTest']);
};
