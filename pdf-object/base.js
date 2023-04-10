'use strict';
const { Buffer } = require('buffer');


const BASE_ENCODE = 'ascii';
function encode(jsString) {
    return Buffer.from(jsString, BASE_ENCODE)
};
exports.encode = encode;

function encodeOct(jsString) {
    return Buffer.from(jsString, BASE_ENCODE)[0]
};
exports.encodeOct = encodeOct;

Object.assign(exports, {
    BASE_ENCODE: BASE_ENCODE,

    ASCII_NULL: 0,
    ASCII_HT: 9,
    ASCII_LF: 10,
    ASCII_FF: 12,
    ASCII_CR: 13,
    ASCII_BS: 8,
    ASCII_SPACE: 32,

    ASCII_n: encodeOct('n'),
    ASCII_r: encodeOct('r'),
    ASCII_t: encodeOct('t'),
    ASCII_b: encodeOct('b'),
    ASCII_f: encodeOct('f'),
    ASCII_R: encodeOct('R'),

    PLUS_SIGN: encodeOct('+'),
    MINUS_SIGN: encodeOct('-'),
    DOT_SIGN: encodeOct('.'),
    DIGIT_0: encodeOct('0'),
    DIGIT_7: encodeOct('7'),
    DIGIT_9: encodeOct('9'),

    HEX_0: encodeOct('0'),
    HEX_9: encodeOct('9'),
    HEX_A: encodeOct('A'),
    HEX_Z: encodeOct('Z'),
    HEX_a: encodeOct('a'),
    HEX_z: encodeOct('z'),

    LEFT_PARENTHESIS: encodeOct('('),
    RIGHT_PARENTHESIS: encodeOct(')'),
    LESS_THAN_SIGN: encodeOct('<'),
    GREATER_THAN_SIGN: encodeOct('>'),
    LEFT_SQUARE_BRACKET: encodeOct('['),
    RIGHT_SQUARE_BRACKET: encodeOct(']'),
    LEFT_CURLY_BRACKET: encodeOct('{'),
    RIGHT_CURLY_BRACKET: encodeOct('}'),
    SOLIDUS: encodeOct('/'),
    REVERSE_SOLIDUS: encodeOct('\\'),
    PERCENT_SIGN: encodeOct('%'),
    NUMBER_SIGN: encodeOct('#'),
    DOUBLE_LESS_THAN_SIGN: encode('<<'),
    DOUBLE_GREATER_THAN_SIGN: encode('>>'),

    NULL: encode('null'),
    TRUE: encode('true'),
    FALSE: encode('false'),

    PDF_HEADER: encode("%PDF-"),
    XREF: encode('xref'),
    TRAILER: encode('trailer'),
    STARTXREF: encode('startxref'),
    EOF_MARKER: encode('%%EOF'),
    BOOL_TRUE: encode('true'),
    BOOL_FALSE: encode('false'),

    INDIRECT_REFERENCE_KEY: Symbol("R"),
    INDIRECT_OBJ_INUSE: Symbol("in-use"),
    INDIRECT_OBJ_FREE: Symbol("free"),

    OBJ: encode('obj'),
    ENDOBJ: encode('\nendobj'),
    STREAM: encode('stream'),
    ENDSTREAM: encode('\nendstream')

});


const {
    ASCII_SPACE,
    ASCII_HT,
    ASCII_LF,
    ASCII_CR,
    ASCII_FF,
    ASCII_NULL,

    DIGIT_0, DIGIT_7, DIGIT_9,

    HEX_0, HEX_9, HEX_A, HEX_Z, HEX_a, HEX_z

} = exports;

exports.isSpace = function (o) {
    return o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL;
    // #TODO: run statistics to get the best sorting
};

exports.isDigit = function (o) {
    return DIGIT_0 <= o && o <= DIGIT_9;
};

exports.isHexDigit = function (o) {
    return (HEX_0 <= o && o <= HEX_9) || (HEX_A <= o && o <= HEX_Z) || (HEX_a <= o && o <= HEX_z);
};

exports.isOctalDigit = function (o) {
    return DIGIT_0 <= o && o <= DIGIT_7;
};

// check is Js string
exports.isJsString = function (o) {
    return typeof o === 'string' || o instanceof String
};

module.exports = exports