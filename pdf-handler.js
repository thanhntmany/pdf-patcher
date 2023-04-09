'use strict';
const Fs = require('fs');

const PDFParser = require('./pdf-parser');
const PDFPagesHandler = require('./pdf-pages-handler');

/*
 * PDFHandler
 */
function PDFHandler(buffer) {
    this.parser = new PDFParser(buffer);
    this.root = this.parser.getRootWalker();
};

PDFHandler.fromFile = function (file) {
    return new this(Fs.readFileSync(file));
}


const _proto = PDFHandler.prototype;

_proto.getPages = function (pageNum) {
    return new PDFPagesHandler(this.root.prop('Pages'), this);
};


module.exports = exports = PDFHandler;
