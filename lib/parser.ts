import * as base from './base';
import * as inner from './import-parser';

export interface ParseOptions {
    filePath : string;
    data : string;
}

export function parse(options : ParseOptions) : base.Module {
    let exps = inner.parse(options.data);
    return new base.Module({
        filePath: options.filePath,
        exps
    })
}
