'use strict';
const Os = require('os');
const { Buffer } = require('buffer');
const Fs = require('fs');

const BASE_ENCODE = 'ascii',
    ASCII_NULL = 0,
    ASCII_HT = 9,
    ASCII_LF = 10,
    ASCII_FF = 12,
    ASCII_CR = 13,
    ASCII_SPACE = 32,
    EOF_MARKER = Buffer.from('%%EOF', BASE_ENCODE),
    STARTXREF = Buffer.from('startxref', BASE_ENCODE),
    PERCENT_SIGN = Buffer.from('%', BASE_ENCODE);

/*
 * PDFparser
 */
function PDFparser(buffer) { //https://nodejs.org/api/buffer.html#class-buffer
    var buff = Buffer.from(buffer);
    this.buf = buff;
    this.pointer = 0;
    this.length = buff.length;

    this.obj = {}
};

PDFparser.fromFile = function (file) {
    return new PDFparser(Fs.readFileSync(file));
};

const PDFparser_proto = PDFparser.prototype;


/*
 * Base operations
 */
PDFparser_proto.resetPointer = function (byteOffset) {
    this.pointer = byteOffset || 0;
};

PDFparser_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

PDFparser_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

PDFparser_proto.indexOfNextLine = function (byteOffset) {
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

PDFparser_proto.readLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset;
    return this.sub(p, (this.pointer = this.indexOfNextLine(p)));
};

PDFparser_proto.isWhitespace = function (o) {
    return o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
}

PDFparser_proto.skipSpaces = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, buf = this.buf, o, l = buf.length;

    while (p < l) {
        o = buf[p];
        if (!(o === ASCII_NULL
            || o === ASCII_HT
            || o === ASCII_LF
            || o === ASCII_FF
            || o === ASCII_CR
            || o === ASCII_SPACE
        )) return (this.pointer = p);

        // Skip comment
        if (o === PERCENT_SIGN) p = this.indexOfNextLine(p);

        p++;
    };

    return (this.pointer = l);
};


/*
 * Parsing Objects
 */



/*
 * Main operations
 */

const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
PDFparser_proto.parseHeader = function () {
    var p = this.buf.indexOf(PDF_HEADER);
    var header = this.sub(p, this.indexOfNextLine(p)).toString().replace(/^\s+|\s+$/g, "");
    var tokens = header.match(/\d+/g);
    return {
        header: header,
        version: tokens
    };
};

PDFparser_proto.parseStartXref = function (byteOffset) {
    var pEOF = this.buf.lastIndexOf(EOF_MARKER, byteOffset || -1);
    var pSTARTXREF = this.buf.lastIndexOf(STARTXREF, pEOF);
    return parseInt(this.readLine(this.indexOfNextLine(pSTARTXREF)).toString());
};

PDFparser_proto.parseXrefBuf = function () {

};

PDFparser_proto.parseXref = function () {

};


module.exports = exports = PDFparser