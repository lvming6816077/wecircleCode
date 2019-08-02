
/**
 * service worker 用了offline-plugin之后，这个文件就不使用了
 */
var cacheName = 'bs-0-2-0'
var cacheFiles = [
//   '/',
//   './index.html'
  './lib/weui/weui.min.js',
  './lib/slider/slider.js',
  './lib/weui/weui.min.css'
]

// 监听install事件，安装完成后，进行文件缓存
self.addEventListener('install', function (e) {
  console.log('Service Worker 状态： install')

  // 找到key对应的缓存并且获得可以操作的cache对象
  var cacheOpenPromise = caches.open(cacheName).then(function (cache) {
    // 将需要缓存的文件加进来
    return cache.addAll(cacheFiles)
  })
  // 将promise对象传给event
  e.waitUntil(cacheOpenPromise)
})

// 监听activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
self.addEventListener('activate', function (e) {
  console.log('Service Worker 状态： activate')
  var cachePromise = caches.keys().then(function (keys) {
    // 遍历当前scope使用的key值
    return Promise.all(keys.map(function (key) {
      // 如果新获取到的key和之前缓存的key不一致，就删除之前版本的缓存
      if (key !== cacheName) {
        return caches.delete(key)
      }
    }))
  })
  e.waitUntil(cachePromise)
  // 保证第一次加载fetch触发
  return self.clients.claim()
})

self.addEventListener('fetch', function (e) {
  console.log('现在正在请求：' + e.request.url)

  e.respondWith(
    // 判断当前请求是否需要缓存
    caches.match(e.request).then(function (cache) {
      // 有缓存就用缓存，没有就从新发请求获取
      return cache || fetch(e.request)
    }).catch(function (err) {
      console.log(err)
      // 缓存报错还直接从新发请求获取
      return fetch(e.request)
    })
  )
})

/* ============== */
/* push处理相关部分 */
/* ============== */
// 添加service worker对push的监听
self.addEventListener('push', function (e) {
  var data = e.data
  if (e.data) {
    data = data.json()
    console.log('push的数据为：', data)
    self.registration.showNotification(data.text)
  } else {
    console.log('push没有任何数据')
  }
})
/* ============== */
