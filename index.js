'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');
const PDFParser = require('./pdf-buffer-parser');


var sample = `
(This string contains \\0053two octal characters\\053.)
`;

var pdf = new PDFParser(Buffer.from(sample, 'ascii'));


var i, l = pdf.randomAccess.buf.length, v;
for (i = 0; i < l; i++) {
   v = pdf.randomAccess.setP(i).parseString();
   console.log(i + " --> " + v);
};

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)