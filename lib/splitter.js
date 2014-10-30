'use strict';

var parser = require('css-parse'),// use css.parse instead
  stringifyer = require('css-stringify');


function Splitter() {
}

// public
Splitter.prototype.split = function (cssString, maxSelectors) {

    var ast = this._parseCSS(cssString);
    this.__totalSelectors = iterateRules(ast.stylesheet.rules, 0, true);

    return this._splitCSS(ast, maxSelectors);
};

Splitter.prototype._parseCSS = function (cssString) {
    if(typeof cssString !== 'string') {
        throw new Error('cssString must be a string');
    }

    if(cssString.length < 1) {
        throw new Error('cssSting must not be empty');
    }

    // https://github.com/reworkcss/css#cssparsecode-options
    return parser(cssString, {position: true});
};


Splitter.prototype._splitCSS = function (ast, maxSelectors) {
    return this._toPages(ast, maxSelectors)
      .map(function (page) {

        return stringifyer(page);

    }.bind(this));
};

var iterateRules = function (rules, total, isRoot) {
    total = total || 0;

    rules.forEach(function (style) {
        var childTotal = 0;
        if (style.type == 'rule' || style.type == 'media') {
            //console.log('found rule');
            if (typeof style.selectors === 'object') {
                childTotal += style.selectors.length;
            }

            if (style.rules) {
                childTotal = iterateRules(style.rules, childTotal);
            }
        }

        if (isRoot) {
            // Write the result to a global store
            style.totalSelectors = childTotal;
        }
        total += childTotal;
    });


    return total;
};


Splitter.prototype._toPages = function (ast, maxSelectors) {
    var pages = [], _self = this,clone = this._cloneAST(ast);
    clone.stylesheet.rules = [];
    pages.push(clone);


    // instead of iterating pages, iterate rules until they are scattered in pages.
    var selectorsForThisPage = 0;
    ast.stylesheet.rules.forEach(function (rule) {
        if (selectorsForThisPage + rule.totalSelectors < maxSelectors) {
            selectorsForThisPage += rule.totalSelectors;
            clone.stylesheet.rules.push(rule);
        }
        else {
            selectorsForThisPage = rule.totalSelectors;
            clone = _self._cloneAST(ast);
            clone.stylesheet.rules = [];
            clone.stylesheet.rules.push(rule);
            pages.push(clone);
        }
    });
    return pages;
};

Splitter.prototype._cloneAST = function (ast) {
    return JSON.parse(JSON.stringify(ast));
};

module.exports = function () {

    if(!parser || !stringifyer) {
        throw new Error('parser is required');
    }

    return new Splitter(parser, stringifyer);
};
