'use strict';
const PDFFilter = require("./filter");

/*
 * PDFOStream
 */

// #TODO: refactor to new struct

function PDFOStream(dictionary, stream, parser) {
    this.dictionary = dictionary;
    this.stream = stream;
    this.parser = parser;
};
const _class = PDFOStream, _proto = _class.prototype;

_proto.decodeExternalStream = function () {
    const jsValue = this.parser.jsValue.bind(this.parser);

    var dict = this.dictionary.toJs();
    if (!dict.hasOwnProperty('F')) return this;

    this.stream = this.parser.loadFileSpecification(dict.F);
    dict.Length = this.stream.length;// The length of loaded stream is more trustworthy than "DL"
    dict.Filter = dict.FFilter;
    dict.DecodeParms = dict.FDecodeParms;

    delete dict.F;
    delete dict.FFilter;
    delete dict.FDecodeParms;
    delete dict.DL;

    return this.decode();
};

_proto.decode = function () {
    const jsValue = this.parser.jsValue.bind(this.parser);

    // Ref: PDF32000_2008.pdf - 7.3.8.2 Stream Extent - Table 5
    if (jsValue(this.dictionary, "Length") === 0) return this.decodeExternalStream()

    var Filter = jsValue(this.dictionary, "Filter");
    if (!Filter) return this;

    if (!Array.isArray(Filter)) Filter = [Filter];

    var DecodeParms = jsValue(this.dictionary, "DecodeParms");
    if (!Array.isArray(DecodeParms)) DecodeParms = [DecodeParms];

    var filterName, DecodeParm;
    while ((filterName = jsValue(Filter.shift())) !== undefined) {
        DecodeParm = DecodeParms.shift();
        this.stream = PDFFilter(filterName).decode(this.stream, DecodeParm, this.parser);
        this.dictionary.Length = this.stream.length;
    };

    if (Filter.length === 0) {
        delete this.dictionary.Filter;
        delete this.dictionary.DecodeParms;
    } else {
        this.dictionary.Filter = Filter;
        this.dictionary.DecodeParms = DecodeParms;
    };

    return this;
};

_proto.encode = function () {
    // #TODO:
};

_proto.toJSON = function () {
    return this.toJs();
};

_proto.toString = function (encode) {
    return this.toJs().toString(encode);
};

_proto.toJs = function () {
    return this.stream;
};

_proto.toPdf = _proto.encode;


module.exports = exports = _class;
_class.parseIndirectObject = function (dictionary, stream, parser) {
    return (new this(dictionary, stream, parser)).decode().stream;
};
