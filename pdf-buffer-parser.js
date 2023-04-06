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
    PERCENT_SIGN = Buffer.from('%', BASE_ENCODE),
    LESS_THAN_SIGN = Buffer.from('<', BASE_ENCODE),
    GREATER_THAN_SIGN = Buffer.from('>', BASE_ENCODE),
    DOUBLE_LESS_THAN_SIGN = Buffer.from('<<', BASE_ENCODE),
    DOUBLE_GREATER_THAN_SIGN = Buffer.from('>>', BASE_ENCODE);

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

const _proto = PDFparser.prototype;


/*
 * Base operations
 */
_proto.resetPointer = function (byteOffset) {
    this.pointer = byteOffset || 0;
};

_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

_proto.indexOfNextLine = function (byteOffset) {
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

_proto.readLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset;
    return this.sub(p, (this.pointer = this.indexOfNextLine(p)));
};

_proto.isWhitespace = function (o) {
    return o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
}

_proto.skipSpaces = function (byteOffset) {
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


_proto.parseDictionary = function(byteOffset) {
    var p = this.buf.indexOf(DOUBLE_LESS_THAN_SIGN, byteOffset);
    p = this.skipSpaces(p);
    // XXXXXXXXXXXXXXXXXXxx
}



/*
 * Main operations
 */
const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
_proto.parseHeader = function () {
    var p = this.buf.indexOf(PDF_HEADER);
    var header = this.sub(p, this.indexOfNextLine(p)).toString().replace(/^\s+|\s+$/g, "");
    var tokens = header.match(/\d+/g);
    return {
        header: header,
        version: tokens
    };
};

_proto.parseStartXref = function (byteOffset) {
    var pEOF = this.buf.lastIndexOf(EOF_MARKER, byteOffset || -1);
    var pSTARTXREF = this.buf.lastIndexOf(STARTXREF, pEOF);
    return parseInt(this.readLine(this.indexOfNextLine(pSTARTXREF)).toString());
};

_proto.parseXrefBuf = function () {

};

_proto.parseXref = function () {

};

// #TODO: extract parsing procedure outof main operations

module.exports = exports = PDFparser