module.exports = function(babel, options) {
  const { types: t } = babel;
  const transformUri = options.transformUri ?? (r => r)

  function hasImport(bodyPath, uri) {
    return bodyPath.filter(path => t.isImportDeclaration(path.node)).some(path => path.node.source.value === uri)
  }
  
  let bodyPath;

  return {
    visitor: {

      Program(path) {
        bodyPath = path.get('body')
      },

      CallExpression(path) {
        const callee = path.get('callee');
        // Bridge.Previewer.preview
        if (
          !(callee.get('object').matchesPattern('Bridge.Previewer') &&
          callee.get('property').isIdentifier({ name: 'preview' }))
          &&
          callee.toString() !== 'preview'
        ) {
          return 
        }
       
          const arg = path.get('arguments')[0];
          if (!arg?.isObjectExpression()) return

          const argValue = arg.evaluate()
          if (!argValue.confident) {
            const isLocalNode = arg.node.properties?.find?.(n => n.key.name === 'isLocal')
            const isLocalValue = isLocalNode?.value.value
            if (isLocalValue === true) {
              throw new Error('本地预览文件uri必须是一个固定值')
            }
            return
          }
          const { value: { isLocal, uri } } = argValue
          if (!isLocal) return;
          const uriValue = transformUri(uri);
          const importNode = t.importDeclaration([], t.stringLiteral(uriValue));
          if (!hasImport(bodyPath, uriValue)) {
            bodyPath[0].insertBefore(importNode)
          }
      },
    },
  };
};
