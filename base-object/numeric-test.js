'use strict';
const PDFParser = require('../pdf-parser');
const _class = require('./numeric')

var parser = PDFParser.from(`
123
43445
+17
-98
0

34.5
-3.62
+123.6
4.
-.002
0.0
`);

var i, l = parser.buf.length;
for (i = 0; i<l; i++) {
    console.log(_class.parse(parser.setP(i)))
};