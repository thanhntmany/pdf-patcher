'use strict';
const {
    BOOL_TRUE,
    BOOL_FALSE
} = require('./base');


function PDFOBoolean(value) {
    this._ = value;
};
const _class = PDFOBoolean, _proto = _class.prototype;

_class.parse = function (parser) {
    var p = parser.p, buf = parser.buf;
    if (BOOL_TRUE.equals(buf.subarray(p, p + BOOL_TRUE.length))) {
        parser.p = p + BOOL_TRUE.length;
        return new this(true);
    };
    if (BOOL_FALSE.equals(buf.subarray(p, p + BOOL_FALSE.length))) {
        parser.p = p + BOOL_FALSE.length;
        return new this(false);
    };
    return undefined;
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

_proto.toPDF = function () {
    return this._ ? BOOL_TRUE : BOOL_FALSE;
};


module.exports = exports = _class;