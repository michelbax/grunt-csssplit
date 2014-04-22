/*jshint -W030*/

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require('sinon-chai'));

var splitterPath = '../lib/splitter';

describe('splitter module', function () {

    it('exists', function () {
        expect(require(splitterPath)).to.exist;
    });

    it('is a function', function () {
        expect(require(splitterPath)).to.be.a.function;
    });

    it('returns an object', function () {
        expect(require(splitterPath)({}, {})).to.exist;
        expect(require(splitterPath)({}, {})).to.be.an.object;
    });

    it('requires two parameters', function () {
        expect(require(splitterPath).bind(this, {})).to.throw();
    });

    describe('splitter instance', function () {

        var instance, css, ast;

        beforeEach(function () {
            css = 'body{font-size:16px;}';
            ast = {
                type: 'stylesheet',
                stylesheet: {
                    rules: [{}, {}, {}, {}, {}, {}]
                }
            };
        });

        describe('split function', function () {
            var result;

            beforeEach(function () {
                result = [css];
                instance = require(splitterPath)({}, {});
                instance._parseCSS = sinon.stub().returns(ast);
                instance._splitCSS = sinon.stub().returns(result);
            });

            it('exists', function () {
                expect(instance.split).to.exist;
            });

            it('takes two paramters', function () {
                expect(instance.split).to.have.length(2);
            });

            it('calls the _parseCSS function with the css parameter', function () {
                instance.split(css, 1);
                expect(instance._parseCSS).to.have.been.calledWith(css);
            });

            it('calls the _splitCSS function with the result of _parseCSS', function () {
                instance.split(css, 1);
                expect(instance._splitCSS).to.have.been.calledWith(ast, 1);
            });

            it('returns the result of _splitCSS', function () {
                expect(instance.split(css, 1)).to.equal(result);
            });
        });

        describe('_parseCSS function', function () {
            var parser;

            beforeEach(function () {
                parser = sinon.stub().returns(ast);
                instance = require(splitterPath)(parser, {});
            });

            it('exists', function (){
                expect(instance._parseCSS).to.exist;
            });

            it('is a function', function () {
                expect(instance._parseCSS).to.be.a('function');
            });

            it('takes a single argument', function () {
                expect(instance._parseCSS).to.have.length(1);
            });

            it('throws an error if the supplied argument is not a string', function () {
                expect(instance._parseCSS.bind(instance, 123)).to.throw();
            });

            it('throws an error if the supplied string has a length of 0', function () {
                expect(instance._parseCSS.bind(instance, '')).to.throw();
            });

            it('calls _parser.parse', function () {
                instance._parseCSS(css);
                expect(parser).to.have.been.called;
            });

            it('returns the result of calling _parser.parse', function () {
                expect(instance._parseCSS(css)).to.equal(ast);
            });
        });

        describe('_splitCSS function', function () {
            var pages;

            beforeEach(function () {
                pages = [{}, {}, {}, {}, {}, {}];

                instance = require(splitterPath)({}, {});

                instance._stringifyer = sinon.stub().returns('');
                instance._calcPageCount = sinon.stub().returns(6);
                instance._toPages = sinon.stub().returns(pages);

                instance._splitCSS(ast, 1);
            });

            it('exists', function () {
                expect(instance._splitCSS).to.exist;
            });

            it('is a function', function () {
                expect(instance._splitCSS).to.be.a('function');
            });

            it('takes two arguments', function () {
                expect(instance._splitCSS).to.have.length(2);
            });

            it('calls _calcPageCount', function () {
                expect(instance._calcPageCount).to.have.been.calledWith(ast, 1);
            });

            it('calls _toPages with the result of the calcPageCount function', function () {
                expect(instance._toPages).to.have.been.calledWith(6);
            });

            it('calls _stringifyer with each page', function () {

                pages.forEach(function (page) {
                    expect(instance._stringifyer).to.have.been.calledWith(page);
                });
            });

            it('returns the result of mapping _toPages to _stringifyer', function () {
                expect(instance._splitCSS(ast, 1)).to.eql(['', '', '', '', '', '']);
            });

        });

        describe('_calcPageCount', function () {

            beforeEach(function () {
                instance = require(splitterPath)({}, {});
            });

            it('exists', function () {
                expect(instance._calcPageCount).to.exist;
            });

            it('is a function', function () {
                expect(instance._calcPageCount).to.be.a('function');
            });

            it('returns the correct page count for an ast with an exact page count', function () {
                expect(instance._calcPageCount(ast, 2)).to.equal(3);
            });

            it('returns the correct page count for an ast with an uneven page count', function () {
                expect(instance._calcPageCount(ast, 4)).to.equal(2);
            });
        });

        describe('_toPages', function () {
            beforeEach(function () {
                instance = require(splitterPath)({}, {});
            });

            it('exists', function () {
                expect(instance._toPages).to.exist;
            });

            it('is a function', function () {
                expect(instance._toPages).to.be.a('function');
            });

            it('takes three arguments', function () {
                expect(instance._toPages).to.have.length(3);
            });

            it('returns an array', function () {
                expect(instance._toPages(3, ast, 2)).to.be.an('array');
            });
        });
    });
});
