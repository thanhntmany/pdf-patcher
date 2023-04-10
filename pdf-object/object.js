'use strict';
const Base = require('./base');


function loadEnv() {
    const {
        ASCII_R,
        LESS_THAN_SIGN,
        LEFT_SQUARE_BRACKET,
        LEFT_PARENTHESIS,
        SOLIDUS,
        INDIRECT_REFERENCE_KEY,
        MINUS_SIGN,
        DOT_SIGN,
        PLUS_SIGN,
        isDigit
    } = Base;

    const PDFOBoolean = require('./boolean'),
        PDFONumeric = require('./numeric'),
        PDFOString = require('./string'),
        PDFOName = require('./name'),
        PDFOArray = require('./array'),
        PDFODictionary = require('./dictionary'),
        PDFOStream = require('./stream'),
        PDFOIndirect = require('./indirect'),
        PDFONull = require('./null');

    const parse = function (parser) {
        var p = parser.skipSpaces().p, buf = parser.buf, o = buf[p];
        if (o === undefined) return undefined;
        switch (o) {
            case LESS_THAN_SIGN:// << - Dictionary, < - StringHex
                return buf[p + 1] === LESS_THAN_SIGN ? PDFODictionary.parse(parser) : PDFOString.parseStringHex(parser);

            case LEFT_SQUARE_BRACKET:// [ - Array
                return PDFOArray.parse(parser);

            case LEFT_PARENTHESIS:// ( - StringLiteral
                return PDFOString.parseStringLiteral(parser);

            case SOLIDUS:// / - Name
                return PDFOName.parse(parser);

            case ASCII_R:// R - Indirect Reference
                if (buf[p + 1] !== ASCII_R) {
                    parser.p = p + 1;
                    return INDIRECT_REFERENCE_KEY;
                };
                break;

            default:
                break;
        };

        if (isDigit(o) || o === MINUS_SIGN || o === DOT_SIGN || o === PLUS_SIGN) return PDFONumeric.parse(parser);

        return PDFOBoolean.parse(parser) || PDFONull.parse(parser) || undefined;
    };

    return Object.assign(
        {},
        Base,
        {
            PDFOBoolean: PDFOBoolean,
            PDFONumeric: PDFONumeric,
            PDFOString: PDFOString,
            PDFOName: PDFOName,
            PDFOArray: PDFOArray,
            PDFODictionary: PDFODictionary,
            PDFOStream: PDFOStream,
            PDFOIndirect: PDFOIndirect,
            PDFONull: PDFONull,
            parse: parse
        }
    );

};


var env = null;
module.exports = function () {
    return env || (env = loadEnv());
};
