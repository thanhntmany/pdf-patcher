'use strict';


require('./base')
const PDFParser = require('../pdf-parser');

var parser = PDFParser.from(`<<
    /Type /Example
    /Subtype /DictionaryExample
    /Version 0.01
    /IntegerItem 12
    /StringItem (a string)
    /Subdictionary <<
        /Array [ 549 3.14 false (Ralph) /SomeName ]
        /Bool [true false null]
        /Item1 0.4
        /Item2 true
        /IRObj 12 0 R
        /ArrAr [1 (thanh) [5 /Some#053Name] 3]
        /LastItem (not !)
        /VeryLastItem (OK)
        /XXxX null
    >>
    /TestName [
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
    ]
    /TestString [
(These \\
two strings \\
are the same.)
(These two strings are the same.)
    ]
>>
`);


var i, l = parser.buf.length;
for (i = 0; i < 1; i++) {
    var s = parser.setP(i).parseObject();
    console.log("----------------------------")
    if (s) console.dir(s, { depth: null })
};
