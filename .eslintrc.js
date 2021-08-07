module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es6: true,
  },
  'extends': [
    'plugin:vue/essential',
    // "eslint:recommended",
    // "@vue/prettier",
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 关闭冲突规则
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     semi: true, // 句尾添加分号
    //     tabWidth: 2, // 缩进字节数
    //     printWidth: 120, // 超过最大值换行
    //     endOfLine: 'auto', // 结尾是 \n \r \n\r auto
    //     singleQuote: true, // 使用单引号代替双引号
    //     arrowParens: 'avoid', // (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
    //     trailingComma: 'all', // 在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
    //     bracketSpacing: true, // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
    //     proseWrap: 'never', // 不使用。因为使用了一些折行敏感型的渲染器（如GitHub comment）而按照markdown文本样式进行折行
    //     htmlWhitespaceSensitivity: 'ignore', // 包裹文字时候结束标签的结尾尖括号掉到了下一行
    //   },
    //   {
    //     usePrettierrc: false,
    //     fileInfoOptions: {
    //       withNodeModules: true,
    //     },
    //   },
    // ],
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
