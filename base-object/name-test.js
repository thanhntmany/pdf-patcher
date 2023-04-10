'use strict';
const PDFParser = require('../pdf-parser');
const PDFOName = require('./name');

const _class = require('./name')

var parser = PDFParser.from(`
/Name1

/ASomewhatLongerName
/A;Name_With-Various***Characters?
/1.2
/$$
/@pattern
/.notdef
/lime#20Green
/paired#28#29parentheses
/The_Key_of_F#23_Minor
/A#42
`);

var i, l = parser.buf.length;
for (i = 0; i<l; i++) {
    var s = _class.parse(parser.setP(i));
    if (s) console.log("" + s)
};