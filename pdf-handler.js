'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');

const PDFParser = require('./pdf-parser');

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



module.exports = exports = PDFHandler;

