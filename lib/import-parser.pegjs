{
  const B = require('./base');
}

start
  = tokens:token* { return new B.Module(tokens) }

EOF
  = !.

token
  = comment
  / importExp
  / requireExp
  / regex
  / string
  / builtInGlobalExp
  / sourceChar

lineTerm
  = "\r\n"
  / "\r"
  / "\n"
  / "\u2028" // line separator
  / "\u2029" // paragraph separator

regex
  = "/" chars:regexChar+ "/" { return '/' + chars.join('') + '/'; }

regexChar
  = "\\/" / [^/]

comment
  = singleLineComment
  / multiLineComment

singleLineComment
  = "//" chars:_singleLineCommentChar* { return {comment: "//" + chars.join('') } }

_singleLineCommentChar
  = [^\r\n\u2028\u2029]

multiLineComment
  = "/*" chars:_multiLineCommentChar* "*/" { return { comment: "/*" + chars.join('') + "*/" } }

_multiLineCommentChar
  = "*" !"/" { return '*' }
  / [^*]

string
  = _singleQuoteString
  / _doubleQuoteString
  / _backTickString

_singleQuoteChar
  = "\\" seq:sourceChar { return "\\"+seq; }
  / !("'" / "\\" / lineTerm ) char_:sourceChar { return char_; }

_singleQuoteString
  = parts:("'" _singleQuoteChar* "'") { return "'" + parts[1].join('') + "'" }

_doulbeQuoteChar
  = "\\" seq:sourceChar { return "\\" + seq; }
  / !('"' / "\\" / lineTerm) char_:sourceChar { return char_; }

_doubleQuoteString
  = parts:('"' _doulbeQuoteChar* '"') { return '"' + parts[1].join('') + '"' }

_backTickChar
 = "\\" seq:sourceChar { return "\\" + seq }
 / !("`" / "\\" / lineTerm ) char_:sourceChar { return char_; }

_backTickString
  = parts:("`" _backTickChar* "`") { return '`' + parts[1].join('') + '`' }

rspecString
  = "'" chars:_singleQuoteChar* "'" { return { spec : chars.join(''), quote: "'" }; }
  / '"' chars:_doulbeQuoteChar* '"' { return { spec: chars.join(''), quote: '"' }; }

requireExp
  = "require" whitespace* "("? whitespace* spec:rspecString whitespace* ")"?  { return { require: spec.spec, quote: spec.quote } }

importExp
  = "import" whitespace* as:_importAsExp spec:_importFromExp { return { import: spec.spec, as: as, quote : spec.quote } }
  / "import" whitespace* items:_importItemsExp spec:_importFromExp { return { import: spec.spec, items: items, quote: spec.quote } }
  / "import" whitespace* id:identifier "=" whitespace* req:requireExp { return { import: req, id: id } }
  / "import" whitespace* spec:rspecString { return { import : spec.spec, quote: spec.quote } }

_importAsExp
  = "*" whitespace* "as" whitespace* id:identifier whitespace* { return id }

_importItemsExp
  = "{" whitespace* items:_importItemsListExp "}" whitespace { return items }

_importItemsListExp
  = h:identifier whitespace* items:_importItemExp* ("," whitespace*)? { return [ h ].concat(items) }

_importItemExp
  = "," whitespace* id:identifier { return id }

_importFromExp
  = "from" whitespace* spec:rspecString { return spec }

builtInGlobalExp
  = "process" !_identifierChar { return { global: 'process' } }
  / "__dirname" !_identifierChar { return { global : '__dirname' } }
  / "__filename" !_identifierChar { return { global : '__filename' } }
  / "module" !_identifierChar { return { global: 'module' } }
  / "exports" !_identifierChar { return { global: 'exports' } }
  / "Buffer" !_identifierChar { return { global : 'Buffer' } }
  / "global" !_identifierChar { return { global : 'global' } }

identifier
  = a:_identifierStartChar rest:_identifierChar* whitespace* { return { identifier : [ a ].concat(rest).join('') }}

_identifierStartChar
  = [a-zA-Z\$_]

_identifierChar
  = [a-zA-Z\$_0-9]

whitespace
  = [ \r\n\t]

sourceChar
  = .
