import { pluginTester } from 'babel-plugin-tester'
import prettier from 'prettier'

import AutoImportUriPlugin from '../src/plugin'
pluginTester({
  plugin: AutoImportUriPlugin,
  formatResult: r => prettier.format(r, {
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    parser: 'babel'
  }),

  tests: {
    '默认情况': {
      code: `
      Bridge.Previewer.preview({
        isLocal: true,
        uri: 'https:/xxxx',
      })
      `,
      output: `
      import 'https:/xxxx';
      Bridge.Previewer.preview({
        isLocal: true,
        uri: 'https:/xxxx',
      });
      `
    },

    'uri是一个常量的情况': {
      code: `
      const uri = 'http://xxx'
      Bridge.Previewer.preview({
        isLocal: true,
        uri,
      })`,
      output: `
      import 'http://xxx';
      const uri = 'http://xxx';
      Bridge.Previewer.preview({
        isLocal: true,
        uri,
      });
      `
    },

    '已经手动引入的情况': {
      code: `
      import "a.pdf"
      Bridge.Previewer.preview({
        isLocal: true,
        uri: 'a.pdf'
      })
      `,
      output: `
      import 'a.pdf';
      Bridge.Previewer.preview({
        isLocal: true,
        uri: 'a.pdf',
      });
      `
    },

    'isLocal = false': {
      code: `
      Bridge.Previewer.preview({
        isLocal: false,
        uri: 'a.pdf'
      })
      `,
      output: `
      Bridge.Previewer.preview({
        isLocal: false,
        uri: 'a.pdf',
      });
      `
    },

    'uri是一个变量且isLocal=true,抛错': {
      code: `
      var uri = ''
      if (Math.random() > .4) uri = 'hello'
      else uri = 'world'
      Bridge.Previewer.preview({
        isLocal: true,
        uri
      })
      `,
      throws: true,
    },

    'uri是一个变量且isLocal=false': {
      code: `
      var uri = ''
      if (Math.random() > .4) uri = 'hello'
      else uri = 'world'
      Bridge.Previewer.preview({
        isLocal: false,
        uri
      })
      `,
      output: `
      var uri = '';
      if (Math.random() > 0.4) uri = 'hello';
      else uri = 'world';
      Bridge.Previewer.preview({
        isLocal: false,
        uri,
      });
      `
    },

    'preview({}) 直接调用': {
      code: `
      preview({
        isLocal: true,
        uri: 'x'
      })
      `,
      output: `
      import 'x';
      preview({
        isLocal: true,
        uri: 'x',
      });
      `
    },

    'transformUri 测试': {
      code: `
      preview({
        isLocal: true,
        uri: 'x'
      })
      preview({
        isLocal: true,
        uri: 'd'
      })
      `,
      output: `
      import '@x';
      import '~d';
      preview({
        isLocal: true,
        uri: 'x',
      });
      preview({
        isLocal: true,
        uri: 'd',
      });
      `,
      pluginOptions: {
        transformUri: r => r === 'x' ? `@${r}`: `~${r}`
      }
    }
  }
})
