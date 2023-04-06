'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');

/*
 * PDFPaser
 */
function PDFPaser(buffer) { //https://nodejs.org/api/buffer.html#class-buffer
    var buff = Buffer.from(buffer);
    this.buf = buff;
    this.pointer = 0;
    this.length = buff.length;
};

PDFPaser.fromFile = function (file) {
    return new PDFPaser(Fs.readFileSync(file));
};

const PDFPaser_proto = PDFPaser.prototype;


/*
 * Base operations
 */
PDFPaser_proto.viewBytesFrom = function (byteOffset, length) {
    return Buffer.from(this.buf.buffer, this.buf.byteOffset + byteOffset, length);
};

PDFPaser_proto.readLine = function () {
    return Buffer.from(this.buf.buffer, this.buf.byteOffset + byteOffset, length);
};


/*
 * Main operations
 */

const PDF_HEADER = "%PDF-";
PDFPaser_proto.parsePDFHeader = function () {
    return 
}


module.exports = exports = PDFPaser