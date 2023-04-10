'use strict';
const PDFParser = require('../pdf-parser');
const _class = require('./array')


var parser = PDFParser.from(`
[ 549 3.14 false (Ralph) /SomeName ]
`);

var i, l = parser.buf.length;
for (i = 0; i<l; i++) {
    var s = _class.parse(parser.setP(i));
    if (s) console.log(s)
};