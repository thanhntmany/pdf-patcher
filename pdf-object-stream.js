'use strict';


function isString(o) {
    return typeof o === 'string' || o instanceof String
}


/*
 * ObjectStream
 */
function ObjectStream(dictionary, stream, root) {
    this.dictionary = dictionary;
    this.stream = stream;
    this.root = root;
};
const _proto = ObjectStream.prototype;

_proto.resolve = function(obj) {
    return this.root.resolve(obj);
};

_proto.decodeExternalStream = function() {
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

_proto.decode = function() {
    // Ref: PDF32000_2008.pdf - 7.3.8.2 Stream Extent - Table 5
    if (this.dictionary.Length === 0) return this.decodeExternalStream()

    if (!this.dictionary.hasOwnProperty('Filter')) return this;

    var Filter = this.dictionary.Filter;
    if (isString(Filter)) Filter = [Filter];

    var DecodeParms = this.dictionary.DecodeParms;
    if (Filter.length === 1 && !Array.isArray(DecodeParms)) DecodeParms = [DecodeParms];


};

module.exports = exports = ObjectStream;