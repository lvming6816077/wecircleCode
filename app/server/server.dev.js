// const fs = require('fs')
// const path = require('path')
// const axios = require('axios')
// const express = require('express')
// const { createBundleRenderer } = require('vue-server-renderer')

// const resolve = file => path.resolve(__dirname, file)

// const app = express()
// const favicon = require('serve-favicon')
// // 配置页面静态资源路径
// const serve = (path, cache) => express.static(resolve(path), {
//   maxAge: 0
// })
// app.use('/js', serve('../dist/js'))
// app.use('/img', serve('../dist/img'))
// app.use('/css', serve('../dist/css'))
// app.use(favicon('./public/favicon.ico'))
// // 页面信息
// const context = {
//   title: 'Vue CLI 3 SSR example',
//   url: ''
// }
// // 构建渲染方法
// const renderer = (bundle, clientManifest) => createBundleRenderer(bundle, {
//   runInNewContext: false,
//   template: fs.readFileSync(resolve('../src/index.temp.html'), 'utf-8'),
//   clientManifest
// })
// const webpack = require('webpack')
// const MemoryFs = require('memory-fs')
// const mfs = new MemoryFs()
// // 1、webpack配置文件
// const webpackConfig = require('@vue/cli-service/webpack.config')

// // 2、编译webpack配置文件
// const serverCompiler = webpack(webpackConfig)
// // 指定输出到的内存流中
// serverCompiler.outputFileSystem = mfs

// // 3、监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
// let bundle
// serverCompiler.watch({}, (err, stats) => {
//   if (err) {
//     throw err
//   }
//   stats = stats.toJson()
//   stats.errors.forEach(error => console.error(error))
//   stats.warnings.forEach(warn => console.warn(warn))
//   const bundlePath = path.join(
//     webpackConfig.output.path,
//     'vue-ssr-server-bundle.json'
//   )
//   bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
//   console.log('new bundle generated')
// })
// // 构建信息
// // const getBundle = () => {
// //   return axios.get('http://localhost:8881/vue-ssr-server-bundle.json')
// // }
// const getManifest = () => {
//   return axios.get('http://localhost:8880/vue-ssr-client-manifest.json').then(res => res.data)
// }

// // const getBuildJson = () => {
// //   return axios.all([getBundle(), getManifest()]).then(axios.spread((bundle, manifest) => {
// //     return { bundle: bundle.data, manifest: manifest.data }
// //   })).catch(err => {
// //     console.log('err', err)
// //   })
// // }
// // let bundle = require('../dist/vue-ssr-server-bundle.json')
// // let manifest = require('../dist/vue-ssr-client-manifest.json')
// const proxy = require('http-proxy-middleware')
// app.use('/sockjs-node', proxy({
//   target: `http://localhost:8880/`,
//   changeOrigin: true,
//   ws: true
// }))
// app.use('*', (req, res) => {
//   getManifest().then(manifest => {
//     if (!bundle) {
//       res.body = '等待webpack打包完成后在访问在访问'
//       return
//     }
//     context.url = req.originalUrl
//     renderer(bundle, manifest).renderToString(context, (err, html) => {
//       if (err) {
//         if (err.url) {
//           console.error('err.url', err.url)
//           res.redirect(err.url)
//         } else {
//           // Render Error Page or Redirect
//           res.status(500).end('500 | Internal Server Error')
//           console.error(`error during render : ${req.url}`)
//           console.error(err.stack)
//         }
//       }
//       res.status(context.HTTPStatus || 200)
//       res.send(html)
//     })
//   })
// })

// const port = process.env.PORT || 3000

// app.listen(port, () => {
//   console.log(`server started at localhost:${port}`)
// })
