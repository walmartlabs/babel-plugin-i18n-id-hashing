"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FUNCTIONS_THAT_DEFINE_MESSAGES = ["defineMessages"];
var IDENTIFIERS_THAT_CONTAIN_MESSAGES = ["defaultMessages"];

var i18nIdHashing = function i18nIdHashing(_ref) {
  var t = _ref.types;

  var referencesImport = function referencesImport(pathNode, mod, importedNames) {
    if (pathNode.isSequenceExpression()) {
      var _ret = function () {
        var sequenceExpressionValue = pathNode.node.expressions[pathNode.node.expressions.length - 1];

        if (sequenceExpressionValue.property && sequenceExpressionValue.property.name) {
          return {
            v: importedNames.some(function (name) {
              return name === sequenceExpressionValue.property.name;
            })
          };
        }
      }();

      if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    } else if (pathNode.isIdentifier() || pathNode.isJSXIdentifier()) {
      return importedNames.some(function (name) {
        return pathNode.referencesImport(mod, name);
      });
    }
    return false;
  };

  /**
   * @param  {Object}  opts - A Babel options object
   *
   * @return {Object}  Returns the module name to search for imports of. Defaults to `react-intl`
   */
  var getModuleSourceName = function getModuleSourceName(opts) {
    return opts.moduleSourceName || "react-intl";
  };

  /**
   * @param  {Object}  opts - A Babel options object
   *
   * @return {Object}  Returns the Identifier name to search for calls of. Defaults to
   * `defaultMessages`
   */
  var getIdentifiersThatContainMessages = function getIdentifiersThatContainMessages(opts) {
    return opts.varsContainingMessages || IDENTIFIERS_THAT_CONTAIN_MESSAGES;
  };

  /**
   * @param  {Object}  opts - A Babel options object
   *
   * @return {Object}  Returns the Identifier name to search for calls of. Defaults to
   * `defaultMessages`
   */
  var getIdentifiersThatDefineMessages = function getIdentifiersThatDefineMessages(opts) {
    return opts.functionsDefiningMessages || FUNCTIONS_THAT_DEFINE_MESSAGES;
  };

  /**
   * @param  {String}  hashKey - A string used to generate a SHA1 hash
   *
   * @return {Object}  A SHA1 hash of the hashKey
   */
  var getHash = function getHash(hashKey) {
    return _crypto2.default.createHash("sha1").update(hashKey || "").digest("hex");
  };

  /**
   * @param  {Object}  filePath - The path to the file Babel is running over
   *
   * @return {Object}  Returns the path relative to the cwd
   */
  var getRelativeFilePath = function getRelativeFilePath(filePath) {
    return _path2.default.relative(process.cwd(), filePath);
  };

  /**
   * @param  {Object}  filePath - The path to the file Babel is running over
   *
   * @return {Object}  A SHA1 hash of the path relative to the cwd
   */
  var getFileHash = function getFileHash(filePath) {
    return getHash(getRelativeFilePath(filePath));
  };

  /**
   * @param  {ASTNode}  pathNode - An AST node representing a POJO.
   *
   * @return {Object}  A POJO representation of an AST node
   */
  var generateObjectFromNode = function generateObjectFromNode(pathNode) {
    return pathNode.get("properties").map(function (prop) {
      var isKeyIdentifier = prop.get("key").node.type === "Identifier";
      var objectKey = isKeyIdentifier ? prop.get("key").node.name : prop.get("key").node.value;

      return [objectKey, prop.get("value").node.value];
    }).reduce(function (previousValue, property) {
      previousValue[property[0]] = property[1];
      return previousValue;
    }, {});
  };

  var processMessage = function processMessage(fileHash, messageObj) {
    if (!(messageObj[1] && messageObj[1].isObjectExpression())) {
      throw messageObj.buildCodeFrameError("[babel-plugin-i18n-id-hashing] " + messageObj.node.name + "() must be called with message " + "descriptors defined as object expressions.");
    }

    var objectIdProperty = messageObj[1].get("properties")
    // Returns all an array for keyNode, ValueNode pairs
    .map(function (prop) {
      return [prop.get("key"), prop.get("value")];
    })
    // Returns [[idKeyNode, idValueNode]]
    .filter(function (prop) {
      // TODO: Find out why does this happens and if this is the correct solution.
      // All "value" attributes become "name" when interpreting a JSX file.
      var value = prop[0].node.value;
      var name = prop[0].node.name;

      return (value || name) === "id";
    })
    // Returns [idKeyNode, idValueNode]
    .pop()
    // Retuens idValueNode
    [1]; //eslint-disable-line no-unexpected-multiline

    var objectProperties = generateObjectFromNode(messageObj[1]);
    var generatedMessageId = fileHash + "." + objectProperties.id;

    // TODO: Error if the object key and the id property are mismatched

    // Replace the Object's key with the generatedMessageId
    var objectKey = messageObj[0];
    objectKey.replaceWith(t.stringLiteral(generatedMessageId));
    // Replace the Object's `id` property with the generatedMessageId
    objectIdProperty.replaceWith(t.stringLiteral(generatedMessageId));
  };

  return {
    visitor: {
      CallExpression: function CallExpression(pathNode, state) {
        var moduleSourceName = getModuleSourceName(state.opts);
        var callee = pathNode.get("callee");

        // Return if the call expression is either
        //   - not found in a file that imports `react-intl`
        //   - is not a call to one of the FUNCTIONS_THAT_DEFINE_MESSAGES
        var identifierWhitelist = getIdentifiersThatDefineMessages(state.opts);
        if (referencesImport(callee, moduleSourceName, identifierWhitelist) === false) {
          return;
        }

        var fileHash = getFileHash(state.file.opts.filename);

        // FUNCTIONS_THAT_DEFINE_MESSAGES functions are of the form function(Object messages)
        // https://github.com/yahoo/react-intl/blob/2fdf9e7e695fa04673573d72ab6265f0eef3f98e/src/react-intl.js#L25-L29
        pathNode.get("arguments")[0].get("properties").map(function (prop) {
          return [prop.get("key"), prop.get("value")];
        }).forEach(processMessage.bind(null, fileHash));
      },

      // TODO: if this gets called before CallExpression Visitor - register a search for that key
      MemberExpression: function MemberExpression(pathNode, state) {
        // TODO: register messageName when ExpressionStatement is called
        if (!(getIdentifiersThatContainMessages(state.opts).indexOf(pathNode.node.object.name) !== -1)) {
          return;
        }

        // Ensure the node is not processed multiple times as other plugins modify the tree. This
        // should be handled by pathNode.skip() but there is a bug
        // https://phabricator.babeljs.io/T7117
        if (pathNode.node.i18nHash) {
          return;
        } else {
          pathNode.node.i18nHash = true;
        }

        var fileHash = getFileHash(state.file.opts.filename);
        var accessor = pathNode.get("property");

        if (accessor.type === "StringLiteral") {
          accessor.replaceWith(t.stringLiteral(fileHash + "." + accessor.node.value));
        } else {
          // Convert xMemberExpression.identifier -> xMemberExpression[identifier]
          pathNode.node.computed = true;
          // Add the hash to the result of any Identifier or Expression
          accessor.replaceWith(t.binaryExpression("+", t.stringLiteral(fileHash), accessor.node));
        }
      }
    }
  };
};

exports.default = i18nIdHashing;