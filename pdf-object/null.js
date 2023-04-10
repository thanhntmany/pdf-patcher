'use strict';
const {
    NULL
} = require('./base');



function PDFONull() {
    this._ = null;
};
const _class = PDFONull, _proto = _class.prototype;

_class.parse = function (parser) {
    if (parser.skipExpectedBuf(NULL)) return new this();
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
    return NULL;
};


module.exports = exports = _class;