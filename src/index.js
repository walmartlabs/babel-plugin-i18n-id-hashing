"use strict";

const FUNCTION_NAMES = ["defineMessages"]

export default function({ types: t }) {
  function getModuleSourceName(opts) {
    return opts.moduleSourceName || "react-intl";
  }

  function referencesImport(path, mod, importedNames) {
    if (!(path.isIdentifier() || path.isJSXIdentifier())) { return false; }
    return importedNames.some((name) => path.referencesImport(mod, name));
  }

  // TODO: get File specific hash
  // TODO: allow overrides via an option
  function getHash() {
    return "asdasddfg3ferf4"
  }

  function processMessage(messageObj) {
    if (!(messageObj[1] && messageObj[1].isObjectExpression())) {
      throw path.buildCodeFrameError(
        `[babel-plugin-i18n-id-hashing] ${callee.node.name}() must be called with message ` +
        `descriptors defined as object expressions.`
      );
    }

    const objectIdProperty = messageObj[1]
      .get('properties')
      // Returns all an array for keyNode, ValueNode pairs
      .map((prop) => [
        prop.get('key'),
        prop.get('value'),
      ])
      // Returns [[idKeyNode, idValueNode]]
      .filter((prop) => prop[0].node.value === "id")
      // Returns [idKeyNode, idValueNode]
      .pop()
      // Retuens idValueNode
      [1];

    const objectProperties = generateObjectFromNode(messageObj[1]);
    const generatedMessageId = `${getHash(objectProperties)}.${objectProperties.id}`

    // Replace the Object's key with the generatedMessageId
    const objectKey = messageObj[0];
    objectKey.replaceWith(t.stringLiteral(generatedMessageId));
    // Replace the Object's `id` property with the generatedMessageId
    objectIdProperty.replaceWith(t.stringLiteral(generatedMessageId));
  }

  /**
   * @param  {ASTNode}  path - An AST node representing a POJO.
   *
   * @return {Object}  A POJO representation of an AST node
   */
  function generateObjectFromNode(path) {
    return path.get('properties').map((prop) => [
      prop.get('key').node.value,
      prop.get('value').node.value,
    ]).reduce((previousValue, property) => {
      previousValue[property[0]] = property[1]
      return previousValue;
    }, {});
  }

  return {
    visitor: {
      ExpressionStatement(path, state) {
        const moduleSourceName = getModuleSourceName(state.opts);
        const callee = path.get('callee');

        // Return if the call expression is either
        //   - not found in a file that imports `react-intl`
        //   - is not a call to one of the FUNCTION_NAMES
        if(referencesImport(callee, moduleSourceName, FUNCTION_NAMES) === false) { return; }

        // FUNCTION_NAMES functions are of the form function(Object messages)
        // https://github.com/yahoo/react-intl/blob/2fdf9e7e695fa04673573d72ab6265f0eef3f98e/src/react-intl.js#L25-L29
        let messagesObj = path.get('arguments')[0];

        // Process each message
        messagesObj
          .get('properties')
          .map((prop) => [
            prop.get('key'),
            prop.get('value'),
          ])
          .forEach(processMessage);
      },
      // TODO: if this gets called before CallExpression Visitor - register a search for that key
      MemberExpression(path, state) {
        // TODO: Take messageName as an option
        // TODO: register messageName when ExpressionStatement is called
        if (path.node.object.name !== "defaultMessages") { return; }

        let accessor = path.get("property");

        if (accessor.type === "StringLiteral") {
          accessor.replaceWith(t.stringLiteral(`${getHash()}.${accessor.node.value}`))
        } else {
          // Convert xMemberExpression.identifier -> xMemberExpression[identifier]
          path.node.computed = true
          // Add the hash to the result of any Identifier or Expression
          accessor.replaceWith(t.binaryExpression("+", t.stringLiteral(getHash()), accessor.node))
        }
      }
    }
  };
};
