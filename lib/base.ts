import * as V from 'validac';

export interface CommentExp {
    comment: string;
}

export let isCommentExp = V.isObject({ comment: V.isString });

export function commentExpToString(comment : CommentExp) {
    return comment.comment;
}

export interface GlobalIdentifier {
    global: string;
}

export let isGlobalIdentifier = V.isObject({ global: V.isString });

export function globalIdentifierToString(token : GlobalIdentifier) {
    return token.global;
}

export interface Identifier {
    identifier: string;
}

export let isIdentifier = V.isObject({ identifier: V.isString });

export function identifierToString(token : Identifier) {
    return token.identifier;
}

type SpecQuote = `'` | `"`;
let isSpecQuote = V.isEnum('"', "'");

export interface RequireExp {
    require: string;
    quote: SpecQuote;
}

export let isRequireExp = V.isObject({ require: V.isString, quote: isSpecQuote });

export function requireExpToString(spec : RequireExp) {
    return `require(${spec.quote}${spec.require}${spec.quote})`;
}

export interface ImportAsFromExp {
    import: string;
    as : Identifier;
    quote: SpecQuote
}

export let isImportAsFromExp = V.isObject({ import: V.isString, as : isIdentifier , quote : isSpecQuote });

export function importAsFromExpToString(exp : ImportAsFromExp) {
    return `import * as ${identifierToString(exp.as)} from ${exp.quote}${exp.import}${exp.quote}`;
}

export interface ImportItemsFromExp {
    import: string;
    items: Identifier[];
    quote: SpecQuote
}

export let isImportItemsFromExp = V.isObject({ import: V.isString, items: V.isArray(isIdentifier) , quote : isSpecQuote });

export function importItemsFromExpToString(exp : ImportItemsFromExp) {
    let items = exp.items.map((item) => identifierToString(item)).join(', ')
    return `import { ${items} } from ${exp.quote}${exp.import}${exp.quote}`;
}

export interface ImportFromExp {
    import: string;
    quote : SpecQuote
}

export let isImportFromExp = V.isObject({ import : V.isString , quote : isSpecQuote });

export function importFromExpToString(exp: ImportFromExp) {
    return `import ${exp.quote}${exp.import}${exp.quote}`
}

export interface ImportRequireExp {
    import: RequireExp;
    id: Identifier;
}

export let isImportRequireExp = V.isObject({ import: isRequireExp, id: isIdentifier });

export function importRequieExpToString(exp : ImportRequireExp) {
    return `import ${identifierToString(exp.id)} = ${requireExpToString(exp.import)}`;
}

export type ImportExp = ImportAsFromExp | ImportItemsFromExp | ImportFromExp | ImportRequireExp;

export let isImportExp = V.isOneOf(isImportAsFromExp, isImportItemsFromExp, isImportFromExp, isImportRequireExp);

export function importExpToString(exp : ImportExp) {
    // console.log(`******** importExpToString`, exp, isImportAsFromExp.isa(exp));
    if (isImportAsFromExp.isa(exp)) {
        return importAsFromExpToString(exp);
    } else if (isImportItemsFromExp.isa(exp)) {
        return importItemsFromExpToString(exp);
    } else if (isImportFromExp.isa(exp)) {
        return importFromExpToString(exp);
    } else {
        return importRequieExpToString(exp);
    }
}

export type TsLoaderExp = string | CommentExp | ImportExp | RequireExp | GlobalIdentifier;

export let isTypeScriptParseToken = V.isOneOf(V.isString, isCommentExp, isImportExp, isRequireExp , isGlobalIdentifier );

export type TsImportExp = ImportExp | RequireExp;

export let isTsImportExp = V.isOneOf(isImportExp, isRequireExp);

export function tsLoaderExpToString(exp : TsLoaderExp) {
    if (typeof(exp) === 'string') {
        return exp;
    } else if (isCommentExp.isa(exp)) {
        return commentExpToString(exp);
    } else if (isImportExp.isa(exp)) {
        return importExpToString(exp);
    } else if (isGlobalIdentifier.isa(exp)) {
        return globalIdentifierToString(exp);
    } else {
        return requireExpToString(exp);
    }
}

export class Module {
    readonly exps : TsLoaderExp[];
    constructor(exps : TsLoaderExp[]) {
        this.exps = this.normalize(exps);
    }

    normalize(exps : TsLoaderExp[]) {
        let output : TsLoaderExp[] = [];
        let temp : string[] = [];
        exps.forEach((exp) => {
            if (typeof(exp) === 'string') {
                temp.push(exp);
            } else {
                if (temp.length > 0) {
                    output.push(temp.join(''))
                    temp = []
                }
                output.push(exp);
            }
        })
        if (temp.length > 0) {
            output.push(temp.join(''))
            temp = []
        }
        return output;
    }

    toString() {
        return this.exps.map(tsLoaderExpToString).join('');
    }
}
