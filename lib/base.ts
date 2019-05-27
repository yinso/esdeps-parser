import * as V from 'validac';

export interface CommentExp {
    comment: string;
}

export let isCommentExp = V.isObject({ comment: V.isString });

export class Comment implements CommentExp {
    readonly comment : string;
    constructor(options : CommentExp) {
        this.comment = options.comment;
    }

    toString() {
        return this.comment;
    }
}

export function commentExpToString(comment : CommentExp) {
    return comment.comment;
}

export interface GlobalExp {
    global: string;
}

export let isGlobalExp = V.isObject({ global: V.isString });

export class Global implements GlobalExp {
    readonly global : string;
    constructor(options : GlobalExp) {
        this.global = options.global;
    }

    toString() {
        return this.global;
    }
}

export function globalExpToString(token : GlobalExp) {
    return token.global;
}

export interface IdentifierExp {
    identifier: string;
}

export let isIdentifierExp = V.isObject({ identifier: V.isString });

export class Identifier implements IdentifierExp {
    readonly identifier : string;
    constructor(options : IdentifierExp) {
        this.identifier = options.identifier;
    }

    toString() {
        return this.identifier;
    }
}

export function identifierExpToString(token : IdentifierExp) {
    return token.identifier;
}

type SpecQuote = `'` | `"`;
let isSpecQuote = V.isEnum('"', "'");

export interface DependExp {
    depType: string;
    spec: string;
    quote: SpecQuote;
}

export let isDependExp = V.isTaggedObjectFactory<'depType', DependExp>('depType', {
    spec: V.isString,
    quote: isSpecQuote
})

export abstract class Depend implements DependExp {
    abstract readonly depType: string;
    readonly quote : SpecQuote;
    readonly spec : string;
    constructor(options : DependExp) {
        // this.depType = options.depType;
        this.spec = options.spec;
        this.quote = options.quote;
    }

    get isRelative() : boolean {
        return !!this.spec.match(/^\./);
    }

    abstract toString() : string;
}


export interface RequireExp extends DependExp {
    depType: 'require';
}

export let isRequireExp = isDependExp.register<'require', RequireExp>('require', {});

export class Require extends Depend implements RequireExp {
    readonly depType : 'require';
    constructor(options : RequireExp) {
        super(options);
        this.depType = 'require';
    }

    toString() {
        return requireExpToString(this);
    }

    toJSON() {
        return {
            spec: this.spec,
            depType: this.depType,
            quote: this.quote,
        }
    }
}

export function requireExpToString(spec : RequireExp) {
    return `require(${spec.quote}${spec.spec}${spec.quote})`;
}

export interface ImportAsFromExp extends DependExp {
    depType: 'importAsFrom';
    as : IdentifierExp;
}

export let isImportAsFromExp = isDependExp.register<'importAsFrom', ImportAsFromExp>('importAsFrom', {
    as: isIdentifierExp
});

export class ImportAsFrom extends Depend implements ImportAsFromExp {
    readonly depType : 'importAsFrom';
    readonly as : IdentifierExp;
    constructor(options : ImportAsFromExp) {
        super(options);
        this.depType = 'importAsFrom';
        this.as = options.as;
    }

    toString() {
        return importAsFromExpToString(this);
    }
}

export function importAsFromExpToString(exp : ImportAsFromExp) {
    return `import * as ${identifierExpToString(exp.as)} from ${exp.quote}${exp.spec}${exp.quote}`;
}

export interface ImportItemsFromExp extends DependExp {
    depType: 'importItemsFrom';
    items: IdentifierExp[];
}

export let isImportItemsFromExp = isDependExp.register<'importItemsFrom', ImportItemsFromExp>('importItemsFrom', { items: V.isArray(isIdentifierExp) });

export class ImportItemsFrom extends Depend implements ImportItemsFromExp {
    readonly depType : 'importItemsFrom';
    readonly items: IdentifierExp[];
    constructor(options : ImportItemsFromExp) {
        super(options);
        this.depType = 'importItemsFrom';
        this.items = options.items;
    }

    toString() {
        return importItemsFromExpToString(this);
    }
}

export function importItemsFromExpToString(exp : ImportItemsFromExp) {
    let items = exp.items.map((item) => identifierExpToString(item)).join(', ')
    return `import { ${items} } from ${exp.quote}${exp.spec}${exp.quote}`;
}

export interface ImportFromExp extends DependExp {
    depType: 'importFrom';
}

export let isImportFromExp = isDependExp.register<'importFrom', ImportFromExp>('importFrom', { });

export function importFromExpToString(exp: ImportFromExp) {
    return `import ${exp.quote}${exp.spec}${exp.quote}`
}

export class ImportFrom extends Depend implements ImportFromExp {
    readonly depType: 'importFrom';
    constructor(options : ImportFromExp) {
        super(options);
        this.depType = 'importFrom';
    }

    toString() {
        return importFromExpToString(this);
    }
}

export interface ImportRequireExp extends DependExp {
    depType: 'importRequire';
    id: IdentifierExp;
}

export let isImportRequireExp = isDependExp.register<'importRequire', ImportRequireExp>('importRequire', { id: isIdentifierExp });

export function importRequieExpToString(exp : ImportRequireExp) {
    return `import ${identifierExpToString(exp.id)} = ${requireExpToString({
        depType: 'require',
        spec: exp.spec,
        quote: exp.quote
    })}`;
}

export class ImportRequire extends Depend implements ImportRequireExp {
    readonly depType: 'importRequire';
    readonly id: IdentifierExp;
    constructor(options : ImportRequireExp) {
        super(options);
        this.depType = 'importRequire';
        this.id = options.id;
    }

    toString() {
        return importRequieExpToString(this);
    }
}

export function makeDepend(options : DependExp) {
    if (isRequireExp.isa(options)) {
        return new Require(options);
    } else if (isImportAsFromExp.isa(options)) {
        return new ImportAsFrom(options);
    } else if (isImportItemsFromExp.isa(options)) {
        return new ImportItemsFrom(options);
    } else if (isImportFromExp.isa(options)) {
        return new ImportFrom(options);
    } else if (isImportRequireExp.isa(options)) {
        return new ImportRequire(options);
    } else {
        throw new Error(`InvalidDepend: ${JSON.stringify(options)}`)
    }
}

export type ImportExp = ImportAsFromExp | ImportItemsFromExp | ImportFromExp | ImportRequireExp;

export function dependExpToString(exp : DependExp) : string {
    // console.log(`******** importExpToString`, exp, isImportAsFromExp.isa(exp));
    if (isImportAsFromExp.isa(exp)) {
        return importAsFromExpToString(exp);
    } else if (isImportItemsFromExp.isa(exp)) {
        return importItemsFromExpToString(exp);
    } else if (isImportFromExp.isa(exp)) {
        return importFromExpToString(exp);
    } else if (isImportRequireExp.isa(exp)) {
        return importRequieExpToString(exp);
    } else if (isRequireExp.isa(exp)) {
        return requireExpToString(exp);
    } else {
        throw new Error(`UnknownExp: ${JSON.stringify(exp, null, 2)}`)
    }
}

export type TsLoaderExp = string | CommentExp | DependExp | GlobalExp;

export let isTypeScriptParseToken = V.isOneOf(V.isString, isCommentExp, isDependExp , isGlobalExp );

export function tsLoaderExpToString(exp : TsLoaderExp) : string {
    if (typeof(exp) === 'string') {
        return exp;
    } else if (isCommentExp.isa(exp)) {
        return commentExpToString(exp);
    } else if (isDependExp.isa(exp)) {
        return dependExpToString(exp);
    } else if (isGlobalExp.isa(exp)) {
        return globalExpToString(exp);
    } else {
        throw new Error(`UnknownExp: ${JSON.stringify(exp, null, 2)}`)
    }
}

export interface ModuleOptions {
    filePath : string;
    exps : TsLoaderExp[];
}

export class Module {
    readonly filePath : string;
    private _exps !: TsLoaderExp[];
    constructor(options : ModuleOptions) {
        this.filePath = options.filePath;
        this._exps = this.normalize(options.exps);
    }

    get exps() { return this._exps }

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

    // in order to remove a dep, we will need to do the following.
    removeDep(depend : DependExp) {
        this._exps = this._exps.filter((exp) => {
            return exp !== depend
        });
    }

    moveDep(depend : DependExp, newSpec : string) {
        this._exps = this._exps.map((exp) => {
            if (exp !== depend) {
                return exp;
            } else {
                return makeDepend({
                    ...depend,
                    spec : newSpec
                })
            }
        });
    }

    get depends() : Depend[] {
        return this.exps.filter((exp) : exp is Depend => exp instanceof Depend)
    }

    toString() {
        return this.exps.map(tsLoaderExpToString).join('');
    }
}

export function isRelativeSpec(spec : string) : boolean {
    return !!spec.match(/^\./);
}
