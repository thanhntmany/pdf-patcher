'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFBufferParser = require('./pdf-buffer-parser');


/*
 * PDFHandler
 */
function PDFHandler() {
};
PDFHandler.fromFile = function(file) {
    var buf = Fs.readFileSync(file);
    var obj = new this();
    obj.parser = new PDFBufferParser(buf);
    return obj.init();
}

const PDFHandler_proto = PDFHandler.prototype;

PDFHandler_proto.init = function () {
    this.header = this.parser.parseHeader();
    return this;
}


module.exports = exports = PDFHandler;

