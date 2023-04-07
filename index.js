'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');
const PDFParser = require('./pdf-buffer-parser');


var sample = `

true


<4E6F762073686D6F7A206B6120706F702E>

`;

var pdf = new PDFParser(Buffer.from(sample, 'ascii'));


var i, l = pdf.randomAccess.buf.length, v;
for (i = 0; i < l; i++) {
   v = pdf.randomAccess.setP(i).parseString();
   if (v) console.log(i + " --> " + v);
};


// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)