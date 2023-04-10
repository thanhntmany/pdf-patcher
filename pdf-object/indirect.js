'use strict';
const { OBJ, ENDOBJ, STREAM, ASCII_LF } = require('./base');
const PDFONull = require('./null');
const PDFOStream = require('./stream');


function PDFOIndirect(obj) {
    this._ = obj;
};
const _class = PDFOIndirect, _proto = _class.prototype;

_class.parse = function (parser) {
    var obj = {};
    obj.num = parser.passDigits();
    parser.skipSpaces();

    obj.gen = parser.passDigits();
    parser.skipSpaces();

    if (!parser.skipExpectedBuf(OBJ)) {
        throw new Error(`Could not find expect "${OBJ.toString()}" at offset ${parser.p} \n${parser.subFrom(parser.p, 100).toString()}\nwhen parsing IndirectObject!!`);
    };
    parser.skipSpaces()

    if (parser.skipExpectedBuf(ENDOBJ)) {
        obj.value = new PDFONull();
        return obj;
    };

    obj.value = parser.parseObject();
    parser.skipSpaces();

    // Stream Objects
    if (parser.skipExpectedBuf(STREAM)) {
        parser.passTheNext(ASCII_LF); // Ref: PDF32000_2008.pdf - 7.3.8.1General - NOTE 2

        var dictionary = obj.value,
            streamStart = parser.p,
            streamLength = parser.jsValue(dictionary, "Length"),
            stream = parser.subFrom(streamStart, streamLength);

        obj.value = PDFOStream.parseIndirectObject(dictionary, stream, parser);
    };

    return obj;
};

_proto.dir = function () {
    return this._;
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
