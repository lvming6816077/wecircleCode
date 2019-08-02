
/*
* 用了offline-plugin之后，dist之后这个文件会合并在sw.js里
*/


// 添加service worker对push的监听
self.addEventListener('push', function (e) {
  var data = e.data
  if (e.data) {

    data = data.json()
    // console.log('push的数据为：', data)
    // alert(data.title)
      e.waitUntil(
        self.registration.showNotification(data.title, {
          body: data.body || '',
          icon: data.img || "https://app.nihaoshijie.com.cn/img/icons/apple-touch-icon-180x180-1-touming.png",
          actions: [{
              action: 'go-in',
              title: '进入程序'
          }]
        })
      );
    ;
  } else {
    console.log('push没有任何数据')
  }
})

self.addEventListener('notificationclick', function (e) {
    var action = e.action;
    e.waitUntil(
        // 获取所有clients
        self.clients.matchAll().then(function (clientList) {
          //如果有窗口正在使用，就切换到这个窗口
          if (clientList.length > 0) {
            return clientList[0].focus();
          }

          //如果需要进入程序就新开一个窗口
          if (action === 'go-in') {
            return self.clients.openWindow('https://app.nihaoshijie.com.cn/index.html#/mypage');
          }
            
        })
    );
    e.notification.close();
});
