'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');



function PDFPaser(buffer) { //https://nodejs.org/api/buffer.html#class-buffer

    this.buf = buffer;
};

PDFPaser.fromFile = function(file) {
    return new PDFPaser(Fs.readFileSync(file));
};

const PDFPaser_proto = PDFPaser.prototype;


module.exports = exports = PDFPaser