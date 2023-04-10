'use strict';
const { Buffer } = require('buffer');
const {
    BASE_ENCODE,
    PLUS_SIGN,
    MINUS_SIGN,
    DOT_SIGN,
    isDigit
} = require('./base');


function PDFONumeric(number) {
    this._ = number;
};
const _class = PDFONumeric, _proto = _class.prototype;

_class.parse = function (parser) {
    var p = parser.p, buf = parser.buf, o;
    var num = [];

    o = buf[p];
    if (o === MINUS_SIGN) {
        num.push(MINUS_SIGN);
        p++;
    }
    else if (o === PLUS_SIGN) {
        num.push(PLUS_SIGN)
        p++;
    };

    while (isDigit(o = buf[p])) {
        num.push(o);
        p++;
    };

    o = buf[p];
    if (o === DOT_SIGN) {
        num.push(o);
        p++;
        while (isDigit(o = buf[p])) {
            num.push(o);
            p++;
        };
    };

    if (num.length === 0) return undefined;
    parser.p = p;
    return new this(Number(Buffer.from(num).toString(BASE_ENCODE)));
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

_proto.toJs = function () {
    return this._;
};

_proto.toPdf = function () {
    // #TODO:
};


module.exports = exports = _class;