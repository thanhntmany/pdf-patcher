'use strict';
const PDFOName = require('./name');
const {
    DOUBLE_LESS_THAN_SIGN,
    DOUBLE_GREATER_THAN_SIGN,
    INDIRECT_REFERENCE_KEY
} = require('./base');


function PDFODictionary(obj) {
    this._ = obj;
};
const _class = PDFODictionary, _proto = _class.prototype;

_class.parse = function (parser) {
    if (!parser.skipExpectedBuf(DOUBLE_LESS_THAN_SIGN)) return undefined;

    var buf = parser.buf, l = buf.length, stack = [], item;
    while (parser.skipSpaces().p < l && !parser.skipExpectedBuf(DOUBLE_GREATER_THAN_SIGN)) {
        if ((item = parser.parseObject()) === INDIRECT_REFERENCE_KEY) item = parser.genIndirectReference(stack.pop(), stack.pop());
        stack.push(item);
    };

    var obj = {};
    while (item instanceof PDFOName) obj[String(item)] = stack.shift();
    return new this(obj);
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
