'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');

const PDFParser = require('./pdf-parser');
const PDFPageHandler = require('./pdf-page-handler');

/*
 * PDFHandler
 */
function PDFHandler(buffer) {
    this.parser = new PDFParser(buffer);
    this.root = this.parser.getRootWalker();
};

PDFHandler.fromFile = function(file) {
    return new this(Fs.readFileSync(file));
}

const _proto = PDFHandler.prototype;

_proto.getNoPages = function() {
    return this.root.prop('Pages', 'Kids').value().length;
};

_proto.isolatePage = function(pageNum) {
    return new PDFPageHandler(this.root.prop('Pages', 'Kids', pageNum), this);
};

module.exports = exports = PDFHandler;
