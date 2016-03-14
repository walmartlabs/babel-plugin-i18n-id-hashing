## 2.1.0 (2016-03-14)

#### User Facing Changes

* Correct bug where SequenceExpressions were not being transformed correctly to enable this plugin to run over pre-compiled code

## 2.0.0 (2016-03-04)

#### User Facing Changes

* Hash relative to `process.cwd()` rather than `__dirname`
* Correct bug where object-rest-spread in JSX was recursing through member expressions multiple times

#### Internal Changes

* Correct typo in CHANGELOG

#### Dependency Updates

* "assert-transform": "git -> ^1.0.0",
* "eslint-config-defaults": "^7.1.1 -> ^9.0.0",
* "lodash": "^3.10.1 -> ^4.6.1",

## 1.0.0 (2016-01-28)

Initial Release!
