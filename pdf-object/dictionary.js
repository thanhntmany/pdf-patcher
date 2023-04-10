'use strict';
const {
    DOUBLE_LESS_THAN_SIGN,
    DOUBLE_GREATER_THAN_SIGN,
    INDIRECT_REFERENCE_KEY
} = require('./base');
const PDFOName = require('./name');
const PDFONull = require('./null');


function PDFODictionary(obj) {
    this._ = obj;
};
const _class = PDFODictionary, _proto = _class.prototype;

_class.parse = function (parser) {
    if (!parser.skipExpectedBuf(DOUBLE_LESS_THAN_SIGN)) return undefined;

    var buf = parser.buf, l = buf.length, stack = [], item;
    while (parser.skipSpaces().p < l && !parser.skipExpectedBuf(DOUBLE_GREATER_THAN_SIGN)) {
        if ((item = parser.parseObject()) === INDIRECT_REFERENCE_KEY)
            item = parser.genIndirectReference(stack.pop(), stack.pop());
        stack.push(item);
    };

    var obj = {}, key, value;
    while ((key = stack.shift()) instanceof PDFOName) {
        /* 7.3.7 Dictionary Objects - A dictionary entry whose value is null
        (see 7.3.9, "Null Object") shall be treated the same as if the entry does not exist.
        (This differs from PostScript, where null behaves like any other object as the value of a dictionary entry.)*/
        if ((value = stack.shift()) instanceof PDFONull) continue;

        obj[String(key)] = value;
    };

    return new this(obj);
};

_proto.dir = function () {
    return this._;
};

_proto.prop = function (attr) {
    return this._[attr];
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
