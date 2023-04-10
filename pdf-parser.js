'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');

// const PDFOBoolean = require('./base-object/boolean');
// const PDFONumeric = require('./base-object/numeric');
// const PDFOString = require('./base-object/string');
// const PDFOName = require('./base-object/name');
// const PDFOArray = require('./base-object/array');
// const PDFODictionary = require('./base-object/dictionary');
// const PDFONull = require('./base-object/null');
// const PDFOStream = require('./base-object/stream');

const BASE_ENCODE = 'ascii',
    ASCII_LF = 10,
    ASCII_CR = 13,

    ASCII_R = Buffer.from('R', BASE_ENCODE)[0],

    LEFT_PARENTHESIS = Buffer.from('(', BASE_ENCODE)[0],
    LESS_THAN_SIGN = Buffer.from('<', BASE_ENCODE)[0],
    LEFT_SQUARE_BRACKET = Buffer.from('[', BASE_ENCODE)[0],
    SOLIDUS = Buffer.from('/', BASE_ENCODE)[0],
    PERCENT_SIGN = Buffer.from('%', BASE_ENCODE)[0],

    OBJ = Buffer.from('obj\n', BASE_ENCODE),
    ENDOBJ = Buffer.from('\nendobj', BASE_ENCODE),
    STREAM = Buffer.from('stream', BASE_ENCODE),

    XREF = Buffer.from('xref', BASE_ENCODE),
    TRAILER = Buffer.from('trailer', BASE_ENCODE),
    STARTXREF = Buffer.from('startxref', BASE_ENCODE),
    EOF_MARKER = Buffer.from('%%EOF', BASE_ENCODE),

    PLUS_SIGN = Buffer.from('+', BASE_ENCODE)[0],
    MINUS_SIGN = Buffer.from('-', BASE_ENCODE)[0],
    DOT_SIGN = Buffer.from('.', BASE_ENCODE)[0],

    INDIRECT_OBJ_INUSE = Symbol("in-use"),
    INDIRECT_OBJ_FREE = Symbol("free")
    ;


const {
    INDIRECT_REFERENCE_KEY,
    isSpace, isDigit, isJsString,

    PDFOBoolean,
    PDFONumeric,
    PDFOString,
    PDFOName,
    PDFOArray,
    PDFODictionary,
    PDFONull,
    PDFOStream,

} = require('./base-object');


/*
 * PDFParser
 */
function PDFParser(buffer) {
    this.buf = buffer;
    this.p = 0;// pointer

    this.xref = this.parseTrailer();
    this.cache = {};
};

PDFParser.from = function (string, encoding) {
    return new this(Buffer.from(string, encoding));
};

PDFParser.fromFile = function (file) {
    return new this(Fs.readFileSync(file));
};

const _proto = PDFParser.prototype;

/* Access Object at byteOffset */
_proto.setP = function (p) {
    this.p = isNaN(p) ? 0 : p;
    return this;
};

_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

_proto.indexOfNextLine = function (p) {
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
_proto.skipSpaces = function () {
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

_proto.goToLast = function (expectedBuf) {
    this.p = this.buf.lastIndexOf(expectedBuf, this.p);
    return this;
};

_proto.goToNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    return this;
};

_proto.passTheNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    if (this.p >= 0) this.p += expectedBuf.length || 1;// asume: The length of octect is 1.
    return this;
};

_proto.passDigits = function () {
    var buf = this.buf, p = this.p, start = p;
    while (isDigit(buf[p++])) { };
    return parseInt(this.sub(start, (this.p = p)).toString());
};

_proto.goToNextLine = function () {
    this.p = this.indexOfNextLine(this.p)
    return this;
};

_proto.skipExpectedBuf = function (expectedBuf) {
    var p = this.p, l = expectedBuf.length;

    if (this.subFrom(p, l).compare(expectedBuf) === 0) {
        this.p += l;
        return true;
    };

    return false;
};

_proto.skipExpectedOct = function (oct) {
    if (this.buf[this.p] === oct) {
        this.p += 1;
        return true;
    };

    return false;
};

_proto.readLine = function () {
    return this.sub(this.p, (this.p = this.indexOfNextLine(this.p)));
};

// Parsing Objects
_proto.parseObject = function () {
    var p = this.skipSpaces().p, buf = this.buf, o = buf[p];
    if (o === undefined) return undefined;
    switch (o) {
        case LESS_THAN_SIGN:// << - Dictionary, < - StringHex
            return buf[p + 1] === LESS_THAN_SIGN ? PDFODictionary.parse(this) : PDFOString.parseStringHex(this);

        case LEFT_SQUARE_BRACKET:// [ - Array
            return PDFOArray.parse(this);

        case LEFT_PARENTHESIS:// ( - StringLiteral
            return PDFOString.parseStringLiteral(this);

        case SOLIDUS:// / - Name
            return PDFOName.parse(this);

        case ASCII_R:// R - Indirect Reference
            if (buf[p + 1] !== ASCII_R) {
                this.p = p + 1;
                return INDIRECT_REFERENCE_KEY;
            };
            break;

        default:
            break;
    };

    if (isDigit(o) || o === MINUS_SIGN || o === DOT_SIGN || o === PLUS_SIGN) return PDFONumeric.parse(this);

    return PDFOBoolean.parse(this) || PDFONull.parse(this) || undefined;
};

_proto.parseIndirectObject = function () {
    this.skipSpaces();
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
    if (this.skipExpectedBuf(STREAM)) {
        this.passTheNext(ASCII_LF); // Ref: PDF32000_2008.pdf - 7.3.8.1General - NOTE 2

        var dictionary = obj.value,
            streamStart = this.p,
            streamLength = this.resolve(dictionary.Length),
            stream = this.subFrom(streamStart, streamLength);

        obj.value = PDFOStream.parseIndirectObject(dictionary, stream, this);
    };

    return obj;
};

// Parsing PDF File Structure
const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
_proto.parseHeader = function () {
    var header = this.setP(0).goToNext(PDF_HEADER).readLine().toString().replace(/^\s+|\s+$/g, "");
    return {
        header: header,
        version: header.match(/\d+/g)
    };
};

_proto.genXrefObjectKey = function (num, gen) {
    return String(num) + "-" + String(gen)
};

const XREFSUBSECTION_SPLIT_REGEX = /\s/g;
_proto.parseXrefSubsection = function () {
    var out = {}, key,
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX),
        start = parseInt(tks.shift()), end = start + parseInt(tks.shift()), i;

    for (i = start; i < end; i++) {
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX);
        key = this.genXrefObjectKey(i, parseInt(tks[1]));
        if (tks[2] === 'f') {
            out[key] = {
                status: INDIRECT_OBJ_FREE,
                nextFreeObjNo: parseInt(tks[0])
            };
        }
        else if (tks[2] === 'n') {
            out[key] = {
                status: INDIRECT_OBJ_INUSE,
                p: parseInt(tks[0])
            };
        };
    };

    return out;
};

_proto.parseXrefTable = function () {
    this.goToNext(XREF).goToNextLine();

    var out = {};
    while (isDigit(this.buf[this.p])) {
        Object.assign(out, this.parseXrefSubsection())
    };

    return out;
};

_proto.parseTrailerObj = function () {
    return PDFODictionary.parse(this.passTheNext(TRAILER).skipSpaces());
};

_proto.parseXref = function () {
    // This.p shall be pointing to xref
    return {
        xrefTable: this.parseXrefTable(),
        trailerObj: this.parseTrailerObj()
    }
};

// reverse lookup from this.p
_proto.parseStartXref = function () {
    return parseInt(this.goToLast(EOF_MARKER).goToLast(STARTXREF).goToNextLine().readLine().toString());
};

_proto.parseTrailer = function () {
    return this.setP(this.setP(-1).parseStartXref()).parseXref();
};


// Work with indirect objects
_proto.resolve = function (obj) {
    return obj instanceof IndirectReference ? this.getObject(obj.num, obj.gen) : obj;
};

_proto.resolveIn = function (obj, ...subs) {
    var sub; while (subs.length > 0) {
        if (obj.hasOwnProperty(sub = subs.shift())) {
            obj = this.resolve(obj[sub]);
        }
        else return undefined;
    };
    return obj;
};

_proto.getIndirectObjectOffset = function (num, gen) {
    if (isNaN(gen)) gen = 0;
    var key = this.genXrefObjectKey(num, gen);

    var xref = this.xref;

    if (xref.xrefTable.hasOwnProperty(key)) {
        var entry = xref.xrefTable[key];
        if (entry.status === INDIRECT_OBJ_FREE) return null;

        // Assume: entry.status === INDIRECT_OBJ_INUSE
        return entry.p
    };

    // #TODO: nested case, xrefstrm
};

_proto.loadObject = function (num, gen) {
    var offset = this.getIndirectObjectOffset(num, gen || 0);
    if (isNaN(offset)) return undefined;
    return this.setP(offset).parseIndirectObject().value;
};

_proto.getObject = function (num, gen) {
    if (isNaN(gen)) gen = 0;
    var cache = this.cache, key = this.genXrefObjectKey(num, gen);
    return cache.hasOwnProperty(key) ? cache[key] : cache[key] = this.loadObject(num, gen);
};

// Might return wrong value with the cases of primitive-types obj.
_proto.getKeyOfLoadedObject = function (obj) {
    var key, cache = this.cache;
    for (key in this.cache) if (cache[key] === obj) return key;
    return undefined;
};

// Might return wrong value with the cases of primitive-types obj.
_proto.getRefOfLoadedObject = function (obj) {
    var key = this.getKeyOfLoadedObject(obj);
    if (!isJsString(key)) return key;
    var tokens = key.split("-");
    this.genIndirectReference(tokens.pop(), tokens.pop());
};

// Specific for decodeExternalStream
_proto.loadFileSpecification = function (F) {
    // #TODO: 
};

_proto.genWalker = function (obj) {
    return new Walker(obj, this)
};

_proto.getRootWalker = function () {
    return this.genWalker(this.resolve(this.xref.trailerObj.Root));
};


/*
 * IndirectReference
 */
_proto.genIndirectReference = function (gen_number, obj_number) {
    return new IndirectReference(obj_number, gen_number)
};


function IndirectReference(obj_number, gen_number) {
    this.num = obj_number;
    this.gen = gen_number || 0;
};

IndirectReference.prototype.toString = function () {
    return String(this.num) + " " + String(this.gen) + " R";
};

/*
 * Walker
 */
function Walker(obj, root) {
    this.obj = obj;
    this.root = root;
};
const Walker_proto = Walker.prototype;

Walker_proto.prop = function () {
    return new this.constructor(
        this.root.resolveIn.apply(this.root, [this.obj].concat(Array.prototype.slice.call(arguments))),
        this.root);
};

Walker_proto.value = function () {
    return this.obj;
};

Walker_proto.toJSON = function () {
    return this.obj;
};

Walker_proto.dir = function () {
    console.dir(this.toJSON(), { depth: null });
};


module.exports = exports = PDFParser;
