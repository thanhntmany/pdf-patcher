'use strict';
const Filter = require("./filter");


/*
 * PDFOStream
 */

// #TODO: refactor to new struct

function PDFOStream(dictionary, stream, root) {
    this.dictionary = dictionary;
    this.stream = stream;
    this.root = root;
};
const _class = PDFOStream, _proto = _class.prototype;
_class.parseIndirectObject = function (dictionary, stream, root) {
    return (new this(dictionary, stream, root)).decode().stream;
};


_proto.resolve = function (obj) {
    return this.root.resolve(obj);
};

_proto.decodeExternalStream = function () {
    if (!this.dictionary.hasOwnProperty('F')) return this;

    var dict = this.dictionary;
    this.stream = this.root.loadFileSpecification(dict.F);
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
    // Ref: PDF32000_2008.pdf - 7.3.8.2 Stream Extent - Table 5
    if (this.dictionary.Length === 0) return this.decodeExternalStream()

    if (!this.dictionary.hasOwnProperty('Filter')) return this;

    var Filter = this.dictionary.Filter;
    if (!Array.isArray(Filter)) Filter = [Filter];

    var DecodeParms = this.dictionary.DecodeParms;
    if (!Array.isArray(DecodeParms)) DecodeParms = [DecodeParms];

    var filterName, DecodeParm;
    while ((filterName = Filter.shift()) !== undefined) {
        DecodeParm = DecodeParms.shift();
        this.stream = Filter(filterName).decode(this.stream, DecodeParm, this.root);
        this.stream.Length = this.stream.length;
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

_proto.encode = function() {
    // #TODO:
};

_proto.toPdf = _proto.encode;


module.exports = exports = _class;