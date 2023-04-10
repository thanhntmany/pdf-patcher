'use strict';
const { Buffer } = require('buffer');
const {
    BASE_ENCODE,
    ASCII_SPACE,
    ASCII_HT,
    ASCII_LF,
    ASCII_CR,
    ASCII_FF,
    ASCII_NULL,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    LESS_THAN_SIGN,
    GREATER_THAN_SIGN,
    LEFT_SQUARE_BRACKET,
    RIGHT_SQUARE_BRACKET,
    SOLIDUS,
    PERCENT_SIGN,
    NUMBER_SIGN
} = require('./base');


function isEndOfName(o) {
    return o === undefined
        || o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL
        || o === LEFT_PARENTHESIS
        || o === RIGHT_PARENTHESIS
        || o === LESS_THAN_SIGN
        || o === GREATER_THAN_SIGN
        || o === LEFT_SQUARE_BRACKET
        || o === RIGHT_SQUARE_BRACKET
        || o === SOLIDUS
        || o === PERCENT_SIGN;
};


function PDFOName(uint8ArrayLike) {
    this._ = uint8ArrayLike;
};
const _class = PDFOName, _proto = _class.prototype;

_class.parse = function (parser) {
    var p = parser.p, buf = parser.buf, o = buf[p++];
    if (o !== SOLIDUS) return undefined;

    var t = [];
    while((!isEndOfName(o = buf[p]))) {
        if (o === NUMBER_SIGN) {
            o = Buffer.from(buf.subarray(p + 1, p + 3).toString(BASE_ENCODE), 'hex')[0];
            p += 2;
        };

        t.push(o);
        p++;
    };

    parser.p = p;
    return new this(Buffer.from(t));
};

_proto.value = function () {
    return this._;
};

_proto.toJSON = function () {
    return this._;
};

_proto.toString = function () {
    return String(this._);
};

_proto.toPdf = function () {
    // #TODO:
};


module.exports = exports = _class;
