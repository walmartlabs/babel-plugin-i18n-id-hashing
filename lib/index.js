"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  function referencesImport(path, mod, importedNames) {
    if (!(path.isIdentifier() || path.isJSXIdentifier())) {
      return false;
    }
    return importedNames.some(function (name) {
      return path.referencesImport(mod, name);
    });
  }

  /**
   * @param  {Object}  opts - A Babel options object
   *
   * @return {Object}  Returns the module name to search for imports of. Defaults to `react-intl`
   */
  function getModuleSourceName(opts) {
    return opts.moduleSourceName || "react-intl";
  }

  /**
   * @param  {Object}  opts - A Babel options object
   *
   * @return {Object}  Returns the Identifier name to search for calls of. Defaults to `defaultMessages`
   */
  function getMethodName(opts) {
    return opts.methodName || "defaultMessages";
  }

  /**
   * @param  {String}  hashKey - A string used to generate a SHA1 hash
   *
   * @return {Object}  A SHA1 hash of the hashKey
   */
  function getHash(hashKey) {
    return _crypto2.default.createHash('sha1').update(hashKey || "").digest('hex');
  }

  /**
   * @param  {ASTNode}  path - An AST node representing a POJO.
   *
   * @return {Object}  A POJO representation of an AST node
   */
  function generateObjectFromNode(path) {
    return path.get('properties').map(function (prop) {
      return [prop.get('key').node.value, prop.get('value').node.value];
    }).reduce(function (previousValue, property) {
      previousValue[property[0]] = property[1];
      return previousValue;
    }, {});
  }

  function processMessage(filename, messageObj) {
    if (!(messageObj[1] && messageObj[1].isObjectExpression())) {
      throw _path2.default.buildCodeFrameError("[babel-plugin-i18n-id-hashing] " + callee.node.name + "() must be called with message " + "descriptors defined as object expressions.");
    }

    var objectIdProperty = messageObj[1].get('properties')
    // Returns all an array for keyNode, ValueNode pairs
    .map(function (prop) {
      return [prop.get('key'), prop.get('value')];
    })
    // Returns [[idKeyNode, idValueNode]]
    .filter(function (prop) {
      return prop[0].node.value === "id";
    })
    // Returns [idKeyNode, idValueNode]
    .pop()
    // Retuens idValueNode
    [1];

    var objectProperties = generateObjectFromNode(messageObj[1]);
    var generatedMessageId = getHash(filename) + "." + objectProperties.id;

    // Replace the Object's key with the generatedMessageId
    var objectKey = messageObj[0];
    objectKey.replaceWith(t.stringLiteral(generatedMessageId));
    // Replace the Object's `id` property with the generatedMessageId
    objectIdProperty.replaceWith(t.stringLiteral(generatedMessageId));
  }

  return {
    visitor: {
      CallExpression: function CallExpression(pathNode, state) {
        var moduleSourceName = getModuleSourceName(state.opts);
        var callee = pathNode.get('callee');

        // Return if the call expression is either
        //   - not found in a file that imports `react-intl`
        //   - is not a call to one of the FUNCTION_NAMES
        if (referencesImport(callee, moduleSourceName, FUNCTION_NAMES) === false) {
          return;
        }

        // FUNCTION_NAMES functions are of the form function(Object messages)
        // https://github.com/yahoo/react-intl/blob/2fdf9e7e695fa04673573d72ab6265f0eef3f98e/src/react-intl.js#L25-L29
        var messagesObj = pathNode.get('arguments')[0];

        // Use a relative path to ensure hash key is the same on any system
        var filePath = _path2.default.relative(__dirname, state.file.opts.filename);

        // Process each message
        messagesObj.get('properties').map(function (prop) {
          return [prop.get('key'), prop.get('value')];
        }).forEach(processMessage.bind(null, filePath));
      },

      // TODO: if this gets called before CallExpression Visitor - register a search for that key
      MemberExpression: function MemberExpression(pathNode, state) {
        // TODO: register messageName when ExpressionStatement is called
        if (pathNode.node.object.name !== getMethodName(state.opts)) {
          return;
        }

        // Use a relative path to ensure hash key is the same on any system
        var filePath = _path2.default.relative(__dirname, state.file.opts.filename);

        var accessor = pathNode.get("property");

        if (accessor.type === "StringLiteral") {
          accessor.replaceWith(t.stringLiteral(getHash(filePath) + "." + accessor.node.value));
        } else {
          // Convert xMemberExpression.identifier -> xMemberExpression[identifier]
          pathNode.node.computed = true;
          // Add the hash to the result of any Identifier or Expression
          accessor.replaceWith(t.binaryExpression("+", t.stringLiteral(getHash(filePath)), accessor.node));
        }
      }
    }
  };
};

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FUNCTION_NAMES = ["defineMessages"];

;