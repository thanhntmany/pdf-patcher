'use strict';
const Os = require('os');
const { Buffer } = require('buffer');
const Fs = require('fs');

const BASE_ENCODE = 'ascii';
const ASCII_CR = 13;
const ASCII_LF = 10;
const ASCII_NULL = 0;
const ASCII_HT = 9;
const ASCII_FF = 12;
const ASCII_SPACE = 32;


/*
 * PDFPaser
 */
function PDFPaser(buffer) { //https://nodejs.org/api/buffer.html#class-buffer
    var buff = Buffer.from(buffer);
    this.buf = buff;
    this.pointer = 0;
    this.length = buff.length;

    this.obj = {}
};

PDFPaser.fromFile = function (file) {
    return new PDFPaser(Fs.readFileSync(file));
};

const PDFPaser_proto = PDFPaser.prototype;


/*
 * Base operations
 */
PDFPaser_proto.resetPointer = function (byteOffset) {
    this.pointer = byteOffset || 0;
};

PDFPaser_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

PDFPaser_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

PDFPaser_proto.indexOfNextLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, l = this.buf.length;
    if (p >= l) return l;

    var buf = this.buf, o; while (p < l) {
        if ((o = buf[p]) === ASCII_LF) return p + 1;// LF
        if (o === ASCII_CR) {
            if (buf[p + 1] === ASCII_LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    };

    return l;
};

PDFPaser_proto.readLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset;
    return this.sub(p, (this.pointer = this.indexOfNextLine(p)));
};

PDFPaser_proto.isWhitespace = function (o) {
    return o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
}

PDFPaser_proto.skipSpaces = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, buf = this.buf, o, l = buf.length;
    if (p >= l) return l;

    do {
        o = buf[p++];
    }
    while (
        p < l
        && o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
    );

    return (this.pointer = p);
};

/*
 * Main operations
 */

const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
PDFPaser_proto.parsePDFHeader = function () {
    var p = this.buf.indexOf(PDF_HEADER);
    var header = this.sub(p, this.indexOfNextLine(p)).toString().replace(/^\s+|\s+$/g, "");
    var tokens = header.match(/\d+/g);
    return {
        header: header,
        version: tokens
    }
};


module.exports = exports = PDFPaser