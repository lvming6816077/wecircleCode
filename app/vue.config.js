const OfflinePlugin = require('offline-plugin')
const nodeExternals = require('webpack-node-externals')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'

const dev = process.env.WEBPACK_TARGET === 'serve'

const target = TARGET_NODE ? 'server' : 'client'

const merge = require('lodash.merge')

let plugins = []

// 调试模式下不执行SSR相关逻辑
if (process.env.NODE_ENV === 'production') {
  if (TARGET_NODE) {
    plugins.push(new VueSSRServerPlugin())
  } else {
    plugins.push(new VueSSRClientPlugin())
    plugins.push(new CopyWebpackPlugin([
      {
        from: __dirname + '/nodedist',
        to: __dirname + '/dist'
      }
    ]))
    plugins.push(new OfflinePlugin({
      // 要求触发ServiceWorker事件回调
      ServiceWorker: {
        events: true,
        // push事件逻辑写在另外一个文件里面
        entry: './public/sw-push.js'
      },
      // 更更新策略选择全部更新
      updateStrategy: 'all',
      // 除去一些不需要缓存的文件
      excludes: ['**/*.map', '**/*.svg', '**/*.png', '**/*.jpg', '**/sw-push.js', '**/sw-my.js', '**/*.json'],

      // 添加index.html的更新
      rewrites (asset) {
        if (asset.indexOf('index.html') > -1) {
          return './index.html'
        }

        return asset
      }
    }))
  }
}

module.exports = {

  publicPath: './',
  outputDir: TARGET_NODE ? 'nodedist' : 'dist',
  lintOnSave: true,
  assetsDir: 'static',
  devServer: {
    hot: false
  },
  configureWebpack: {
    // 将 entry 指向应用程序的 server / client 文件
    entry: `./src/entry-${target}.js`,
    // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
    // 并且还会在编译 Vue 组件时，
    // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
    target: TARGET_NODE ? 'node' : 'web',
    // node: TARGET_NODE? undefined : false,
    // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
    output: {
      libraryTarget: TARGET_NODE ? 'commonjs2' : undefined
    },
    // devtool: 'source-map',
    // https://webpack.js.org/configuration/externals/#function
    // https://github.com/liady/webpack-node-externals
    // 外置化应用程序依赖模块。可以使服务器构建速度更快，
    // 并生成较小的 bundle 文件。
    externals: TARGET_NODE ? nodeExternals({
      // 不要外置化 webpack 需要处理的依赖模块。
      // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
      // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
      whitelist: /\.css$/
    }) : undefined,
    optimization: {
      splitChunks: false
    },
    plugins: plugins
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return merge(options, {
          optimizeSSR: false
        })
      })

    // fix ssr hot update bug
    // if (TARGET_NODE) {
    //   config.plugins.delete("hmr");
    // }
  },
  css: {
    sourceMap: true
  }
}
// module.exports = {
//   baseUrl: process.env.NODE_ENV === 'production'
//     ? '//your_url'
//     : '/',

//   outputDir: 'dist',

//   assetsDir: 'static',

//   filenameHashing: true,

//   // When building in multi-pages mode, the webpack config will contain different plugins
//   // (there will be multiple instances of html-webpack-plugin and preload-webpack-plugin).
//   // Make sure to run vue inspect if you are trying to modify the options for those plugins.
//   pages: {
//     index: {
//       // entry for the pages
//       entry: 'src/pages/index/index.js',
//       // the source template
//       template: 'src/pages/index/index.html',
//       // output as dist/index.html
//       filename: 'index.html',
//       // when using title option,
//       // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
//       title: '首页',
//       // chunks to include on this pages, by default includes
//       // extracted common chunks and vendor chunks.
//       chunks: ['chunk-vendors', 'chunk-common', 'index']
//     }
//     // when using the entry-only string format,
//     // template is inferred to be `public/subpage.html`
//     // and falls back to `public/index.html` if not found.
//     // Output filename is inferred to be `subpage.html`.
//     // subpage: ''
//   },

//   // eslint-loader 是否在保存的时候检查
//   lintOnSave: true,

//   // 是否使用包含运行时编译器的Vue核心的构建
//   runtimeCompiler: false,

//   // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
//   transpileDependencies: [],

//   // 生产环境 sourceMap
//   productionSourceMap: false,

//   // cors 相关 https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors
//   // corsUseCredentials: false,
//   // webpack 配置，键值对象时会合并配置，为方法时会改写配置
//   // https://cli.vuejs.org/guide/webpack.html#simple-configuration
//   configureWebpack: (config) => {
//   },

//   // webpack 链接 API，用于生成和修改 webapck 配置
//   // https://github.com/mozilla-neutrino/webpack-chain
//   chainWebpack: (config) => {
//     // 因为是多页面，所以取消 chunks，每个页面只对应一个单独的 JS / CSS
//     config.optimization
//       .splitChunks({
//         cacheGroups: {}
//       });

//     // 'src/lib' 目录下为外部库文件，不参与 eslint 检测
//     config.module
//       .rule('eslint')
//       .exclude
//       .add('/Users/maybexia/Downloads/FE/community_built-in/src/lib')
//       .end()
//   },

//   // 配置高于chainWebpack中关于 css loader 的配置
//   css: {
//     // 是否开启支持 foo.module.css 样式
//     modules: false,

//     // 是否使用 css 分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用 <style> 方式内联至 html 文件中
//     extract: true,

//     // 是否构建样式地图，false 将提高构建速度
//     sourceMap: false,

//     // css预设器配置项
//     loaderOptions: {
//       css: {
//         // options here will be passed to css-loader
//       },

//       postcss: {
//         // options here will be passed to postcss-loader
//       }
//     }
//   },

//   // All options for webpack-dev-server are supported
//   // https://webpack.js.org/configuration/dev-server/
//   devServer: {
//     open: true,

//     host: '127.0.0.1',

//     port: 3000,

//     https: false,

//     hotOnly: false,

//     proxy: null,

//     before: app => {
//     }
//   },
//   // 构建时开启多进程处理 babel 编译
//   parallel: require('os').cpus().length > 1,

//   // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
//   pwa: {},

//   // 第三方插件配置
//   pluginOptions: {}
// };
