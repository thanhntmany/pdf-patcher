'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFParser = require('./pdf-parser');

// Regex to Extract Text Obj: /(?<=BT\n)([\S\s](?!\nET))+[\S\s]/g
// #TODO: Patch Page


// var sample = `
// 0001312 asdasd0 3213654561
// `;

// var pdf = new PDFRandomAccess.PDFParser(Buffer.from(sample, 'ascii'));

// console.log(pdf.buf.toString())
// console.log("---------------")
// pdf.skipSpaces()
// console.log(pdf.passDigits())

// var i, l = pdf.randomAccess.buf.length, v;
// for (i = 0; i < l; i++) {
//    v = pdf.randomAccess.setP(i).parseName();
//    if (typeof v === 'string' || v instanceof String) console.log(i + " --> " + v);
// };

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)

// const buf1 = Buffer.from('ABCD');
// const buf2 = Buffer.from('ABC');

// console.log(buf1.compare(buf2));

var pp = PDFParser.fromFile('./tmpl_page2.pdf');
// console.dir(pp)

var r = pp.getRootWalker()
// console.dir(r)
r.prop('Pages').dir();

// var Pages = pp.resolve(pp.getObject(1, 0).Pages);
// var Kids = pp.resolve(Pages.Kids)
// var Kid0 = pp.resolve(Kids[0])
// console.log("\n-- Kid0 ------------------------------")
// console.dir(Kid0, {depth: null})

// var Resources = pp.resolve(Kid0.Resources)
// console.log("\n-- Resources ------------------------------")
// console.dir(Resources, {depth: null})

// var F1 = pp.resolve(Resources.Font.F1);
// console.log("\n-- F1 ------------------------------")
// console.dir(F1, {depth: null})

// var ToUnicode = pp.resolve(F1.ToUnicode);
// console.log("\n-- ToUnicode ------------------------------")
// console.dir(ToUnicode.toString())

// var Contents = pp.resolve(Kid0.Contents)
// var Content1 = pp.resolve(Contents[0])
// console.log(Content1.toString())
