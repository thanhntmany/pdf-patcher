'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');
const PDFParser = require('./pdf-buffer-parser');


var sample = `

true

false

123
43445
+17
-98
0

34.5
-3.62
false
+123.6
4.
-.002
0.0

`;

var pdf = new PDFParser(Buffer.from(sample, 'ascii'));


var i, l = pdf.randomAccess.buf.length, v;
for (i = 0; i < l; i++) {
   v = pdf.randomAccess.setP(i).parseBoolean();
   console.log(i + " --> " + pdf.randomAccess.setP(i).parseBoolean());
};


// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)