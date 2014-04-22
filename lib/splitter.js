function Splitter(parser, stringifyer) {
    this._parser = parser;
    this._stringifyer = stringifyer;
}

Splitter.prototype.split = function (cssString, maxRules) {
    return this._splitCSS(this._parseCSS(cssString), maxRules);
};

Splitter.prototype._parseCSS = function (cssString) {
    if(typeof cssString !== 'string') {
        throw new Error('cssString must be a string');
    }

    if(cssString.length < 1) {
        throw new Error('cssSting must not be empty');
    }

    return this._parser(cssString, {position: true});
};

Splitter.prototype._splitCSS = function (ast, maxRules) {
    return this._toPages(this._calcPageCount(ast, maxRules), ast, maxRules)

    .map(function (page) {

        return this._stringifyer(page);

    }.bind(this));
};

Splitter.prototype._calcPageCount = function (ast, maxRules) {
    return Math.floor(ast.stylesheet.rules.length / maxRules) +
        Math.min(1, ast.stylesheet.rules.length % maxRules);
};

Splitter.prototype._toPages = function (pageCount, ast, maxRules) {
    var pages = [], remaining, clone, from, to;

    remaining = pageCount;

    while (remaining > 0) {

        clone = this._cloneAST(ast);

        pages.push(clone);

        from = this._from(pageCount, remaining, maxRules);

        to = this._to(from, maxRules, ast);

        clone.stylesheet.rules = clone.stylesheet.rules.slice(from, to);

        remaining -= 1;
    }

    return pages;
};

Splitter.prototype._cloneAST = function (ast) {
    return JSON.parse(JSON.stringify(ast));
};

Splitter.prototype._from = function (pageCount, remaining, maxRules) {
    return (pageCount - remaining) * maxRules;
};

Splitter.prototype._to = function (from, maxRules, ast) {
    return Math.min(from + maxRules, ast.stylesheet.rules.length);
};

module.exports = function (parser, stringifyer) {
    'use strict';

    if(!parser || !stringifyer) {
        throw new Error('parser is required');
    }

    return new Splitter(parser, stringifyer);
};
