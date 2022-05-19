const fs = require('fs')
const path = require('path')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')
const jsdom = require('jsdom')
const { JSDOM } = jsdom


/* 模拟window对象逻辑 */
const resourceLoader = new jsdom.ResourceLoader({
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
});
const dom = new JSDOM('', {
  url:'https://app.nihaoshijie.com.cn/index.html',
  resources: resourceLoader
});

global.window = dom.window
global.document = window.document
global.navigator = window.navigator
window.nodeis = true //给window标识出node环境的标志位
/* 模拟window对象逻辑 */

// const resolve = file => path.resolve(__dirname + '../../public', file)
const resolve = file => path.resolve(__dirname + '../../../http-server/wecircle', file)

const app = express()
// 配置页面静态资源路径
const serve = (path, cache) => express.static(resolve(path), {
  maxAge: 0
})
// app.use('/', serve('../dist/'))
// app.use('/static', serve('./static'))
// app.use('/lib', serve('./lib'))
// app.use('/img', serve('./img'))
// app.use('/favicon.ico', serve('./favicon.ico'))
// app.use('/sw.js', serve('./sw.js'))
// app.use('/sw-push.js', serve('./sw-push.js'))
// app.use('/manifest.json', serve('./manifest.json'))
// app.use('/index.html', serve('./index.html')) // 保留客户端渲染入口
// 页面信息
const context = {
  title: '',
  url: '',
  BASE_URL:'./'
}
// 构建渲染方法
const renderer = (bundle, clientManifest) => createBundleRenderer(bundle, {
  runInNewContext: false,
  template: fs.readFileSync('./index.template.html', 'utf-8'),
  clientManifest
})
console.log(resolve('./vue-ssr-server-bundle.json'))
// 构建信息
let bundle = require(resolve('./vue-ssr-server-bundle.json'))
let manifest = require(resolve('./vue-ssr-client-manifest.json'))

app.use('*', (req, res) => {
  if (!bundle) {
    res.body = '等待webpack打包完成后在访问在访问'
    return
  }
  // console.log(bundle)
  context.url = req.originalUrl
  // console.log(context.url)
  if (req.originalUrl === '/index_ssr' || req.originalUrl === '/index_ssr/') {
    context.url = '/'
  }
  

  renderer(bundle, manifest).renderToString(context, (err, html) => {

    if (err) {
      // 发现报错，直接走客户端渲染
      res.redirect('/')
      // 记录错误信息 这部分内容可以上传到日志平台 便于统计
      console.error(`error during render : ${req.url}`)
      console.error(err)
    }
    res.status(context.HTTPStatus || 200)

    res.send(html)
  })
})

const port = 8888

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
