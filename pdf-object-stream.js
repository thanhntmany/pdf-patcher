'use strict';
const { join } = require('path');


const cacheFilterHandler = {};
function getFilterHandler(filterName) {
    if (cacheFilterHandler.hasOwnProperty(filterName)) return cacheFilterHandler[filterName];

    try {
        return cacheFilterHandler[filterName] = require(join(__dirname, "filter", filterName));
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error(`\nERROR: Cannot find handler for filter "${filterName}"!!\n`)
        }
        else throw error;
    }

    return undefined;
};


/*
 * ObjectStream
 */
function ObjectStream(dictionary, stream, root) {
    this.dictionary = dictionary;
    this.stream = stream;
    this.root = root;
};
ObjectStream.parseIndirectObject = function (dictionary, stream, root) {
    return (new this(dictionary, stream, root)).decode().stream;
};

const _proto = ObjectStream.prototype;

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
        this.stream = getFilterHandler(filterName).decode(this.stream, DecodeParm, this.root);
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

module.exports = exports = ObjectStream;