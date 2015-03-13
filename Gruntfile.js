/*
 * grunt-csssplit
 * https://github.com/robotlovesyou/grunt-csssplit
 *
 * Copyright (c) 2014 Andrew Smith
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'tests/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    csssplit: {
        test: {
            src: 'test/fixtures/**/*.css',
            dest: 'tmp',
            options: {
              maxSelectors:2
              // maxSelectors: 1000,
              // maxPages: 2
            }
        }
    },
    mochaTest: {
        test: {
            options: {
                reporter: 'spec'
            },
            src: 'test/*.js'
        }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'csssplit', 'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
