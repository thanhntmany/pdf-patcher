'use strict';
const { Buffer } = require('buffer');
const {
    LEFT_SQUARE_BRACKET,
    RIGHT_SQUARE_BRACKET,
    INDIRECT_REFERENCE_KEY
} = require('./base');


function PDFOArray(ArrayLike) {
    this._ = ArrayLike;
};
const _class = PDFOArray, _proto = _class.prototype;

_class.parse = function (parser) {
    if (!parser.skipExpectedOct(LEFT_SQUARE_BRACKET)) return undefined;

    var buf = parser.buf, l = buf.length, stack = [], item;
    while (parser.skipSpaces().p < l && !parser.skipExpectedOct(RIGHT_SQUARE_BRACKET)) {
        if ((item = parser.parseObject()) === INDIRECT_REFERENCE_KEY) item = parser.genIndirectReference(stack.pop(), stack.pop());
        stack.push(item);
    };
    return new this(stack);
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
