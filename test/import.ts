import { suite , test } from 'mocha-typescript';
import * as P from '../lib/import-parser';
// import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as assert from 'assert';
import * as util from 'util';


describe('ImportParserTest', function () {
    let testCases = [
        {
            input: 'This is a free form source chars',
            expected: [
                'This is a free form source chars'
            ]
        },
        {
            input: '// this is a comment',
            expected: [
                {
                    comment: '// this is a comment'
                }
            ]
        },
        {
            input: `/**
            This is a multiline comment
            */`,
            expected: [
                {
                    comment: `/**
            This is a multiline comment
            */`,
                }
            ]
        },
        {
            input: `'a single quote string'`,
            expected: [
                `'a single quote string'`
            ]
        },
        {
            input: `"a double quote string"`,
            expected: [
                `"a double quote string"`
            ]
        },
        {
            input: `/a regex/`,
            expected: [
                `/a regex/`
            ]
        },
        {
            input: 'global',
            expected: [
                { global: 'global' }
            ]
        },
        {
            input: `require('validac')`,
            expected: [
                {
                    require: 'validac',
                    quote: `'`
                }
            ]
        },
        {
            input: `require("validac")`,
            expected: [
                {
                    require: 'validac',
                    quote: `"`
                }
            ]
        },
        {
            input: `import * as V from 'validac'`,
            expected: [
                {
                    import: 'validac',
                    as: {
                        identifier: 'V'
                    },
                    quote: `'`
                }
            ]
        },
        {
            input: `import { isString, isAny } from "validac"`,
            expected: [
                {
                    import: 'validac',
                    items: [
                        {
                            identifier: 'isString'
                        },
                        {
                            identifier: 'isAny'
                        }
                    ],
                    quote: `"`
                }
            ]
        },
        {
            input: `import V = require("validac")`,
            expected: [
                {
                    import: {
                        require: 'validac',
                        quote: `"`
                    },
                    id: {
                        identifier: 'V'
                    }
                }
            ]
        },
        {
            input: `import 'validac'`,
            expected: [
                {
                    import: 'validac',
                    quote: `'`
                }
            ]
        }
    ]

    testCases.forEach((testCase) => {
        it(`can parse ${JSON.stringify(testCase.expected, null, 2)}`, function () {
            let mod = P.parse(testCase.input);
            assert.deepEqual(mod.exps, testCase.expected)
            assert.deepEqual(mod.toString(), testCase.input)
        })
    })


})

// @suite class ImportParserTest {
    

//     @test canParseTypeScript() {
//         let data = `
//         const V = require('validac');
//         /** this is a multiline comment */
//         import * as V from "validac"; // an import statement.
//         function foo() {
//             return 1 + 2;
//         }

//         function bar() {
//             process.cwd();
//             global.test(__dirname, _filename);
//         }
//         `;

//         let mod = P.parse(data)
//         console.log(util.inspect(mod, { depth: null, colors: true }));
//         assert.deepEqual(data, mod.toString())
//     }
// }