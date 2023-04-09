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
    console.warn("decodeExternalStream");
    // #TODO:
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