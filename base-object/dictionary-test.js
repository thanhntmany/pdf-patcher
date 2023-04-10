'use strict';
const PDFParser = require('../pdf-parser');
const _class = require('./dictionary')


var parser = PDFParser.from(`<<
    /Type /Example
    /Subtype /DictionaryExample
    /Version 0.01
    /IntegerItem 12
    /StringItem (a string)
    /Subdictionary <<
        /Item1 0.4
        /Item2 true
        /LastItem (not !)
        /VeryLastItem (OK)
        /XXxX null
    >>
>>
`);

var i, l = parser.buf.length;
for (i = 0; i < 1; i++) {
    var s = _class.parse(parser.setP(i));
    if (s) console.dir(s, { depth: null })
};