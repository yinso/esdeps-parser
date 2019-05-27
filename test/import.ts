import { suite , test } from 'mocha-typescript';
import * as P from '../lib/parser';
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
                    depType: 'require',
                    spec: 'validac',
                    quote: `'`
                }
            ]
        },
        {
            input: `require("validac")`,
            expected: [
                {
                    depType: 'require',
                    spec: 'validac',
                    quote: `"`
                }
            ]
        },
        {
            input: `import * as V from 'validac'`,
            expected: [
                {
                    depType: 'importAsFrom',
                    spec: 'validac',
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
                    depType: 'importItemsFrom',
                    spec: 'validac',
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
                    depType: 'importRequire',
                    spec: 'validac',
                    quote: `"`,
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
                    depType: 'importFrom',
                    spec: 'validac',
                    quote: `'`
                }
            ]
        }
    ]

    testCases.forEach((testCase) => {
        it(`can parse ${JSON.stringify(testCase.input, null, 2)}`, function () {
            let mod = P.parse({
                filePath: __filename,
                data: testCase.input
            });
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