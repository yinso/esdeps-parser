# `esdeps-parser` - a JavaScript / TypeScript module parser that returns the full module.

## Install

```
npm install esdeps-parser
```

## Usage

```typescript
import * as P from 'esdeps-parser';

let mod = P.parse(`const util = require('util') ... `);

```
