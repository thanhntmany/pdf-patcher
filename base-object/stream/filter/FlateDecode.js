'use strict';
const zlib = require( 'zlib' );
// https://github.com/nodejs/node/blob/main/src/node_zlib.cc

// #TODO: applying DecodeParm
// Ref: 7.4.4.3 LZWDecode and FlateDecode Parameters


exports.decode = function(stream, DecodeParm, root) {
    return zlib.unzipSync(stream);
};

exports.encode = function() {
    // #TODO:
};