'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');
const PDFParser = require('./pdf-buffer-parser');


var sample = `
The following are valid literal strings:
(This is a string)
(Strings may contain newlines
and such .)
(Strings may contain balanced parentheses () and
special characters (* ! & } ^ % and so on) .)
(The following is an empty string .)
()
(It has zero (0) length .)
`;

var pdf = new PDFParser(Buffer.from(sample, 'ascii'));


var i, l = pdf.randomAccess.buf.length, v;
for (i = 0; i < l; i++) {
   v = pdf.randomAccess.setP(i).parseString();
   if (typeof v === 'string' || v instanceof String) console.log(i + " --> " + v);
};

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)