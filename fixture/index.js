var babel = require("@babel/core");
const AutoImportUri = require('../src')

const inputCode = `
preview({
  isLocal: true,
  uri: 'x'
})
`

const result = babel.transform(inputCode, {
  plugins: [
    [AutoImportUri, {
      transformUri: r => `@${r}`
    }]
  ]
})

console.log(result.code)