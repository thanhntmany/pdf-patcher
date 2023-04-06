'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');


function PDFFileHandler(file) {
    this.rawBuffer = Fs.readFileSync(file)
};
const PDFFileHandler_proto = PDFFileHandler.prototype;


var x = new PDFFileHandler('./tmpl_page2.pdf')


var y = Buffer.from(x.rawBuffer.buffer, x.rawBuffer.byteOffset + 131100, 80)

// console.log(x.rawBuffer.byteOffset);
console.log(y);
console.log(y.toString());
console.log(x.rawBuffer.length);
console.log(x.rawBuffer.buffer);

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)