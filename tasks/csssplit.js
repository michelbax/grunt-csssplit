/*
 * grunt-csssplit
 * https://github.com/robotlovesyou/grunt-csssplit
 *
 * Copyright (c) 2014 Andrew Smith
 * Licensed under the MIT license.
 */

'use strict';

var splitter = require('../lib/splitter')(require('css-parse'), require('css-stringify'));
var path = require('path');
var _ = require('lodash');


module.exports = function(grunt) {

    function ensureConfig(config, file) {
        if (!file[config]) {
            throw new Error(config + ' configuration is required');
        }
    }


    function ensureSrc(file) {
        ensureConfig('src', file);
    }


    function ensureDest(file) {

        ensureConfig('dest', file);

        if(typeof file.dest !== 'string') {
            throw new Error('only a single destination is allowed');
        }
    }


    function ensureDestExists(dest) {
        if (!grunt.file.exists(dest)) {
            grunt.file.mkdir(dest);
        }
    }


    function cssFileToPages(options, filePath) {

        return {
            original: path.basename(filePath),
            pages: checkPageCount(splitter.split(grunt.file.read(filePath), options.maxRules), options, filePath)
        };
    }

    function checkPageCount(pages, options, filePath) {
        if(options.maxPages && pages.length > options.maxPages) {
            throw new Error('Created ' + pages.length + ' pages for file "' + filePath + '"');
        }

        return pages;
    }


    function writeCSSPages(options, splitCSS) {

        ensureDestExists(options.dest);

        var pageNum = 1;

        splitCSS.pages.forEach(function (page) {
            writeCSSPage(page, options, splitCSS.original, pageNum);
            pageNum += 1;
        });
    }


    function writeCSSPage(page, options, originalName, pageNum) {
        grunt.file.write(makeCSSFileName(options, originalName, pageNum), page);
        grunt.log.writeln('File "' + makeCSSFileName(options, originalName, pageNum) + '" created.');
    }


    function makeCSSFileName(options, originalName, pageNum) {
        var basename = path.basename(originalName, '.css');

        var newname = basename + options.suffix + pageNum.toString() + '.css';

        return path.join(options.dest, newname);
    }

    grunt.registerMultiTask('csssplit', 'IE Sucks. Who knew?', function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
          suffix: '_part_',
          maxRules: 4095,
          maxPages: false
        });

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {
            ensureSrc(f);
            ensureDest(f);

            var opts = _.extend({dest: f.dest}, options);

            f
            .src
            .map(cssFileToPages.bind(this, opts))
            .forEach(writeCSSPages.bind(this, opts));
    });
  });

};
