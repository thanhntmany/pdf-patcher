'use strict';
const Os = require('os');
const { Buffer } = require('buffer');
const Fs = require('fs');

const BASE_ENCODE = 'ascii';


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
PDFPaser_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

PDFPaser_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

const EOL = Os.EOL;
const CR = 13;
const LF = 10;
PDFPaser_proto.isEOF = function (byteOffset) {
    return
};

PDFPaser_proto.indexOfNextLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, l = this.buf.length;
    if (p >= l) return l;

    var buf = this.buf, o; while (p < l) {
        if ((o = buf[p]) === LF) return p + 1;// LF
        if (o === CR) {
            if (buf[p + 1] === LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    }

    return l;
};

PDFPaser_proto.readLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset;
    return this.sub(p, (this.pointer = this.indexOfNextLine(p)));
};


/*
 * Main operations
 */

const PDF_HEADER = "%PDF-";
PDFPaser_proto.parsePDFHeader = function () {
    return 0
}


module.exports = exports = PDFPaser