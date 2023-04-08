'use strict';
const Os = require('os');
const { Buffer } = require('buffer');
const Fs = require('fs');
const { log } = require('console');

const BASE_ENCODE = 'ascii',
    ASCII_NULL = 0,
    ASCII_HT = 9,
    ASCII_LF = 10,
    ASCII_FF = 12,
    ASCII_CR = 13,
    ASCII_BS = 8,
    ASCII_SPACE = 32,

    ASCII_n = Buffer.from('n', BASE_ENCODE)[0],
    ASCII_r = Buffer.from('r', BASE_ENCODE)[0],
    ASCII_t = Buffer.from('t', BASE_ENCODE)[0],
    ASCII_b = Buffer.from('b', BASE_ENCODE)[0],
    ASCII_f = Buffer.from('f', BASE_ENCODE)[0],
    ASCII_R = Buffer.from('R', BASE_ENCODE)[0],

    LEFT_PARENTHESIS = Buffer.from('(', BASE_ENCODE)[0],
    RIGHT_PARENTHESIS = Buffer.from(')', BASE_ENCODE)[0],
    LESS_THAN_SIGN = Buffer.from('<', BASE_ENCODE)[0],
    GREATER_THAN_SIGN = Buffer.from('>', BASE_ENCODE)[0],
    LEFT_SQUARE_BRACKET = Buffer.from('[', BASE_ENCODE)[0],
    RIGHT_SQUARE_BRACKET = Buffer.from(']', BASE_ENCODE)[0],
    LEFT_CURLY_BRACKET = Buffer.from('{', BASE_ENCODE)[0],
    RIGHT_CURLY_BRACKET = Buffer.from('}', BASE_ENCODE)[0],
    SOLIDUS = Buffer.from('/', BASE_ENCODE)[0],
    REVERSE_SOLIDUS = Buffer.from('\\', BASE_ENCODE)[0],
    PERCENT_SIGN = Buffer.from('%', BASE_ENCODE)[0],
    NUMBER_SIGN = Buffer.from('#', BASE_ENCODE)[0],
    DOUBLE_LESS_THAN_SIGN = Buffer.from('<<', BASE_ENCODE),
    DOUBLE_GREATER_THAN_SIGN = Buffer.from('>>', BASE_ENCODE),

    NULL = Buffer.from('null', BASE_ENCODE),
    TRUE = Buffer.from('true', BASE_ENCODE),
    FALSE = Buffer.from('false', BASE_ENCODE),

    OBJ = Buffer.from('obj\n', BASE_ENCODE),
    ENDOBJ = Buffer.from('\nendobj', BASE_ENCODE),
    STREAM = Buffer.from('stream\n', BASE_ENCODE),
    ENDSTREAM = Buffer.from('\nendstream', BASE_ENCODE),

    XREF = Buffer.from('xref', BASE_ENCODE),
    TRAILER = Buffer.from('trailer', BASE_ENCODE),
    STARTXREF = Buffer.from('startxref', BASE_ENCODE),
    EOF_MARKER = Buffer.from('%%EOF', BASE_ENCODE),
    BOOL_TRUE = Buffer.from('true', BASE_ENCODE),
    BOOL_FALSE = Buffer.from('false', BASE_ENCODE),

    PLUS_SIGN = Buffer.from('+', BASE_ENCODE)[0],
    MINUS_SIGN = Buffer.from('-', BASE_ENCODE)[0],
    DOT_SIGN = Buffer.from('.', BASE_ENCODE)[0],
    DIGIT_0 = Buffer.from('0', BASE_ENCODE)[0],
    DIGIT_7 = Buffer.from('7', BASE_ENCODE)[0],
    DIGIT_9 = Buffer.from('9', BASE_ENCODE)[0],

    HEX_0 = Buffer.from('0', BASE_ENCODE)[0],
    HEX_9 = Buffer.from('9', BASE_ENCODE)[0],
    HEX_A = Buffer.from('A', BASE_ENCODE)[0],
    HEX_Z = Buffer.from('Z', BASE_ENCODE)[0],
    HEX_a = Buffer.from('a', BASE_ENCODE)[0],
    HEX_z = Buffer.from('z', BASE_ENCODE)[0],

    INDIRECT_REFERENCE_KEY = Symbol("R")
    ;

function isSpace(o) {
    return o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL;
    // #TODO: run statistics to get the best sorting
};

function isDigit(o) {
    return DIGIT_0 <= o && o <= DIGIT_9;
};

function isOctalDigit(o) {
    return DIGIT_0 <= o && o <= DIGIT_7;
};

function isHexDigit(o) {
    return (HEX_0 <= o && o <= HEX_9) || (HEX_A <= o && o <= HEX_Z) || (HEX_a <= o && o <= HEX_z);
};

function isString(o) {
    return typeof o === 'string' || o instanceof String
}

/*
 * PDFParser
 */
function PDFParser(buffer) {
    this.buf = buffer;
    this.p = 0;// pointer

    this.xref = {}
};
const P_proto = PDFParser.prototype;

/* Access Object at byteOffset */
P_proto.setP = function (p) {
    this.p = isNaN(p) ? 0 : p;
    return this;
};

P_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

P_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

P_proto.indexOfNextLine = function (p) {
    if (isNaN(p)) p = this.p;

    var buf = this.buf, l = buf.length, o;
    while (p < l) {
        if ((o = buf[p]) === ASCII_LF) return p + 1;// LF
        if (o === ASCII_CR) {
            if (buf[p + 1] === ASCII_LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    };

    return l;
};

/* ==== work with "p" property ==== */
P_proto.skipSpaces = function () {
    var p = this.p, buf = this.buf, o, l = buf.length;
    while (p < l) {
        o = buf[p];
        if (o === PERCENT_SIGN) p = this.indexOfNextLine(p); // Skip comment
        if (!isSpace(o)) {
            this.p = p;
            return this;
        };
        p++;
    };
    this.p = l
    return this;
};

P_proto.goToLast = function (expectedBuf) {
    this.p = this.buf.lastIndexOf(expectedBuf, this.p);
    return this;
};

P_proto.goToNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    return this;
};

P_proto.passTheNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    if (this.p >= 0) this.p += expectedBuf.length;
    return this;
};

P_proto.passDigits = function () {
    var buf = this.buf, p = this.p, start = p;
    while (isDigit(buf[p++])) { };
    return parseInt(this.sub(start, (this.p = p)).toString());
};

P_proto.goToNextLine = function () {
    this.p = this.indexOfNextLine(this.p)
    return this;
};

P_proto.skipExpectedBuf = function (expectedBuf) {
    var p = this.p, l = expectedBuf.length;

    if (this.subFrom(p, l).compare(expectedBuf) === 0) {
        this.p += l;
        return true;
    };

    return false;
};

P_proto.readLine = function () {
    return this.sub(this.p, (this.p = this.indexOfNextLine(this.p)));
};

// Parsing Objects
P_proto.parseBoolean = function () {
    var p = this.p, buf = this.buf;
    if (BOOL_TRUE.equals(buf.subarray(p, p + BOOL_TRUE.length))) {
        this.p = p + BOOL_TRUE.length;
        return true;
    };
    if (BOOL_FALSE.equals(buf.subarray(p, p + BOOL_FALSE.length))) {
        this.p = p + BOOL_FALSE.length;
        return false;
    };
    return undefined;
};

P_proto.parseNumber = function () {
    var p = this.p, buf = this.buf, o;
    var num = [];

    o = buf[p];
    if (o === MINUS_SIGN) {
        num.push(MINUS_SIGN)
        p++;
    }
    else if (o === PLUS_SIGN) {
        num.push(PLUS_SIGN)
        p++;
    };

    while (isDigit(o = buf[p])) {
        num.push(o);
        p++;
    };

    o = buf[p];
    if (o === DOT_SIGN) {
        num.push(DOT_SIGN);
        p++;
        while (isDigit(o = buf[p])) {
            num.push(o);
            p++;
        };
    };

    this.p = p;
    if (num.length === 0) return NaN;
    return Number(Buffer.from(num).toString());
};

P_proto.parseStringLiteral = function () {
    var p = this.p, buf = this.buf, o = buf[p++];
    if (o !== LEFT_PARENTHESIS) return undefined;

    var depth = 0, ddd;
    var t = [];

    o = buf[p++];
    while (o !== undefined && (o !== RIGHT_PARENTHESIS || depth !== 0)) {

        if (o === REVERSE_SOLIDUS) {
            switch (o = buf[p++]) {
                case ASCII_n: o = ASCII_LF; break;
                case ASCII_r: o = ASCII_CR; break;
                case ASCII_t: o = ASCII_HT; break;
                case ASCII_b: o = ASCII_BS; break;
                case ASCII_f: o = ASCII_FF; break;
                case LEFT_PARENTHESIS: o = LEFT_PARENTHESIS; break;
                case RIGHT_PARENTHESIS: o = RIGHT_PARENTHESIS; break;
                case REVERSE_SOLIDUS: o = REVERSE_SOLIDUS; break;
                case ASCII_LF:
                case ASCII_CR:
                    if (buf[p] === ASCII_LF) p++;
                    continue;
                default:
                    if (isOctalDigit(o)) {
                        ddd = [o];
                        if (isOctalDigit(o = buf[p])) {
                            ddd.push(o); p++;
                            if (isOctalDigit(o = buf[p])) {
                                ddd.push(o); p++;
                            };
                        };
                        o = parseInt(Buffer.from(ddd).toString(BASE_ENCODE), 8);
                    };
                    break;
            };
        }
        else if (o === LEFT_PARENTHESIS) {
            depth++;
        }
        else if (o === RIGHT_PARENTHESIS) {
            depth--;
        };

        t.push(o);
        o = buf[p++];
    };

    this.p = p;
    return Buffer.from(t).toString();
};

P_proto.parseStringHex = function () {
    var p = this.p, buf = this.buf, o = buf[p++];
    if (o !== LESS_THAN_SIGN) return null;

    var t = [];
    do {
        if (isHexDigit(o = buf[p++])) t.push(o);
    }
    while (o !== GREATER_THAN_SIGN);

    this.p = p;
    return Buffer.from(Buffer.from(t).toString(BASE_ENCODE), 'hex').toString();
};

P_proto.parseString = function () {
    var o = this.buf[this.p];

    if (o === LESS_THAN_SIGN) return this.parseStringHex();
    else if (o === LEFT_PARENTHESIS) return this.parseStringLiteral();
    return null;
};


function isEndOfName(o) {
    return o === undefined
        || o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL
        || o === LEFT_PARENTHESIS
        || o === RIGHT_PARENTHESIS
        || o === LESS_THAN_SIGN
        || o === GREATER_THAN_SIGN
        || o === LEFT_SQUARE_BRACKET
        || o === RIGHT_SQUARE_BRACKET
        || o === SOLIDUS
        || o === PERCENT_SIGN;
};

P_proto.parseName = function () {
    var p = this.p, buf = this.buf, o = buf[p++];
    if (o !== SOLIDUS) return undefined;

    var t = [];
    do {
        o = buf[p]; if (isEndOfName(o)) break;

        if (o === NUMBER_SIGN) {
            o = Buffer.from(buf.subarray(p + 1, p + 3).toString(BASE_ENCODE), 'hex')[0];
            p += 2
        };

        t.push(o);
        p++;
    }
    while (true);

    this.p = p;
    return Buffer.from(t).toString();
};

P_proto.parseArray = function () {
    if (!this.skipExpectedBuf(LEFT_SQUARE_BRACKET)) return undefined;
    var buf = this.buf, o,
        stack = [], item;
    while ((o = buf[this.skipSpaces().p]) !== undefined && o !== RIGHT_SQUARE_BRACKET) {
        if ((item = this.parseObject()) === INDIRECT_REFERENCE_KEY) item = new PDFIndirectReference(stack.pop(), stack.pop());
        stack.push(item);
    };

    return stack;
};

P_proto.parseDictionary = function () {
    console.log(this.p)
    console.log(this.sub(this.p, 10).toString())
    console,log("xxx")
    if (!this.skipExpectedBuf(DOUBLE_LESS_THAN_SIGN)) return undefined;

    var buf = this.buf, l = buf.length, p,
        stack = [], item;
    while (!(buf[p = this.skipSpaces().p] === GREATER_THAN_SIGN && buf[p + 1] === GREATER_THAN_SIGN) && p < l) {
        if ((item = this.parseObject()) === INDIRECT_REFERENCE_KEY) item = new PDFIndirectReference(stack.pop(), stack.pop());
        stack.push(item);
    };

    var obj = {};
    while (isString(item = stack.shift())) obj[String(item)] = stack.shift();
    return obj;
}

P_proto.parseObject = function () {
    var p = this.skipSpaces().p, buf = this.buf, o = buf[p];
    if (o === undefined) return undefined;
    switch (o) {
        case LESS_THAN_SIGN:// << - Dictionary, < - StringHex
            return buf[p + 1] === LESS_THAN_SIGN ? this.parseDictionary() : this.parseStringHex();

        case LEFT_SQUARE_BRACKET:// [ - Array
            return this.parseArray();

        case LEFT_PARENTHESIS:// ( - StringLiteral
            return this.parseStringLiteral();

        case SOLIDUS:// / - Name
            return this.parseName();

        case ASCII_R:// R - Indirect Reference
            if (buf[p + 1] !== ASCII_R) {
                this.p = p + 1;
                return INDIRECT_REFERENCE_KEY;
            };
            break;

        default:
            break;
    };

    if (isDigit(o) || o === MINUS_SIGN || o === DOT_SIGN || o === PLUS_SIGN) return this.parseNumber();

    if (this.skipExpectedBuf(NULL)) return null;
    if (this.skipExpectedBuf(TRUE)) return true;
    if (this.skipExpectedBuf(FALSE)) return false;

    return undefined;
};

P_proto.parseStreamObject = function () {
    // #TODO: ###
};

P_proto.parseIndirectObject = function () {
    var obj = {};
    obj.num = this.passDigits();
    this.skipSpaces()
    obj.gen = this.passDigits();
    this.skipSpaces()

    if (!this.skipExpectedBuf(OBJ)) {
        throw new Error(`Could not find expect "${OBJ.toString()}" at offset ${this.p} when parsing IndirectObject!!`);
    };
    this.skipSpaces()

    if (this.skipExpectedBuf(ENDOBJ)) {
        obj.value = null;
        return obj;
    };

    obj.value = this.parseObject();
    this.skipSpaces();

    // Stream Objects
    // #TODO:
    if (this.skipExpectedBuf(STREAM)) obj.streamStart = this.p;

    return obj;
};

// Parsing PDF File Structure
const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
P_proto.parseHeader = function () {
    var header = this.setP(0).goToNext(PDF_HEADER).readLine().toString().replace(/^\s+|\s+$/g, "");
    return {
        header: header,
        version: header.match(/\d+/g)
    };
};

const XREFSUBSECTION_SPLIT_REGEX = /\s/g;
P_proto.parseXrefSubsection = function () {
    var out = {}, key,
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX),
        start = parseInt(tks.shift()), end = start + parseInt(tks.shift()), i;

    for (i = start; i < end; i++) {
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX);
        key = String(i) + "-" + String(parseInt(tks[1]))
        if (tks[2] === 'f') {
            out[key] = {
                status: "free",
                nextFreeObjNo: parseInt(tks[0])
            };
        }
        else if (tks[2] === 'n') {
            out[key] = {
                status: "in-use",
                p: parseInt(tks[0])
            };
        };
    };

    return out;
};

P_proto.parseXrefTable = function () {
    this.goToNext(XREF).goToNextLine();

    var out = {};
    while (isDigit(this.buf[this.p])) {
        Object.assign(out, this.parseXrefSubsection())
    };

    return out;
};

P_proto.parseTrailerObj = function () {
    return this.passTheNext(TRAILER).skipSpaces().parseDictionary();
};

P_proto.parseXref = function (xrefOffset) {
    this.setP(xrefOffset);
    return {
        xrefTable: this.parseXrefTable(),
        trailerObj: this.parseTrailerObj()
    }
};

// reverse lookup from this.p
P_proto.parseStartXref = function () {
    return parseInt(this.goToLast(EOF_MARKER).goToLast(STARTXREF).goToNextLine().readLine().toString());
};

P_proto.parseTrailer = function (byteOffset) {
    if (isNaN(byteOffset)) byteOffset = -1;
    var xrefOffset = this.setP(byteOffset).parseStartXref();
    var xref = this.parseXref(xrefOffset);

    return {
        p: xrefOffset,
        xref: xref
    }
    // #TODO: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

};

/*
 * PDFIndirectReference
 */
function PDFIndirectReference(gen_number, obj_number) {
    this.gen = gen_number || 0;
    this.num = obj_number;
};

function PDFIndirectObject(gen_number, obj_number) {
    this.gen = gen_number || 0;
    this.num = obj_number;
};

/*
 * PDFRandomAccess
 */
function PDFRandomAccess(buffer) {
    this.buf = Buffer.from(buffer);
    this.parser = new PDFParser(this.createBufView());

    this.xref = {}; // obj_number-gen_number/{offset: ##, state: f/n}
    this.cacheObj = {};
};
PDFRandomAccess.fromFile = function (file) {
    return new this(Fs.readFileSync(file));
};

const RA_proto = PDFRandomAccess.prototype;

RA_proto.createBufView = function (byteOffset, length) {
    return Buffer.from(this.buf.buffer, this.buf.byteOffset + (byteOffset || 0), length)
};

RA_proto.loadXref = function (p) {
    return this.parser.parseXrefTable(this.parser.parseStartXref(p));
};

RA_proto.loadIndirectObjectAtOffset = function (offset) {
    // #TODO: XXXXXXXXXXXXXXXXXXXX
};

RA_proto.loadIndirectObject = function (obj_number, gen_number) {
    var entry = this.xref[obj_number][gen_number];

    if (!this.xref.hasOwnProperty(obj_number)) return undefined;
    entry = this.xref[obj_number];

    if (!entry.hasOwnProperty(gen_number)) return undefined;
    entry = entry[gen_number];

    if (entry.state === 'f') return null;
    if (entry.state === 'n') return this.loadIndirectObjectAtOffset(entry.offset);
    return undefined;
};

RA_proto.getObject = function (obj_number, gen_number) {
    var cacheObj = this.cacheObj, hashKey = String(obj_number) + " " + String(gen_number || 0) + " R"
    return cacheObj.hasOwnProperty(hashKey) ? cacheObj[hashKey] : cacheObj[hashKey] = this.loadIndirectObject(obj_number, gen_number);
};

RA_proto.genIndirectReference = function (gen_number, obj_number) {
    return new PDFIndirectReference(this, obj_number, gen_number);
};


module.exports = exports = PDFRandomAccess;
exports.PDFParser = PDFParser;