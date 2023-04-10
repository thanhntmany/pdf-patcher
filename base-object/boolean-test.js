'use strict';
const PDFParser = require('../pdf-parser');
const PDFOBoolean = require('./boolean')

var parser = PDFParser.from(`
true
asda
false
`);

var i, l = parser.buf.length;
for (i = 0; i<l; i++) {
    console.log("" + PDFOBoolean.parse(parser.setP(i)))
};