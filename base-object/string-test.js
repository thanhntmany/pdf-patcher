'use strict';
const PDFParser = require('../pdf-parser');
const _class = require('./string')

var parser = PDFParser.from(`
(These \\
two strings \\
are the same.)
(These two strings are the same.)
`);

var i, l = parser.buf.length, s;
for (i = 0; i<l; i++) {
    s = _class.parse(parser.setP(i));
    if (s) console.log("" + s)
};