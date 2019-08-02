/* eslint-disable */

import * as OfflinePluginRuntime from 'offline-plugin/runtime'
import service from '@/utils/service'

OfflinePluginRuntime.install({

  onUpdateReady: () => {
    // 更新完成之后，调用applyUpdate即skipwaiting()方法
    OfflinePluginRuntime.applyUpdate()
  },
  onUpdated: () => {
    // 弹一个确认框
    weui.confirm('发现新版本，是否更新？', () => {
      // 刷新一下页面
      window.location.reload()
    }, () => {

    }, {
      title: ''
    })
  }
})

if (!navigator.serviceWorker) {
  weui.topTips('请使用指定浏览器，体验前沿的技术')
}

navigator.serviceWorker && navigator.serviceWorker.ready.then((registration) => {
  // publicKey和后台的publicKey对应保持一致

  const publicKey = 'BAWz0cMW0hw4yYH-DwPrwyIVU0ee3f4oMrt6YLGPaDn3k5MNZtqjpYwUkD7nLz3AJwtgo-kZhB_1pbcmzyTVAxA'// 和后台保持一致

  // 获取订阅请求（浏览器会弹出一个确认框，用户是否同意消息推送）
  try {
    if (window.PushManager) {
      registration.pushManager.getSubscription().then(subscription => {
        // weui.topTips(subscription)
        // 如果用户没有订阅 并且是一个登录用户
        if (!subscription && window.localStorage.getItem('cuser')) {
          const subscription = registration.pushManager.subscribe({
            userVisibleOnly: true, // 表明该推送是否需要显性地展示给用户，即推送时是否会有消息提醒。如果没有消息提醒就表明是进行“静默”推送。在Chrome中，必须要将其设置为true，否则浏览器就会在控制台报错
            applicationServerKey: urlBase64ToUint8Array(publicKey)// web-push定义的客户端的公钥，用来和后端的web-push对应，需要进行一次转换
          })

          // 用户同意
            .then(function (subscription) {
              weui.topTips('获取到subscription')
              // console.log(JSON.stringify(subscription))
              if (subscription && subscription.endpoint) {
                // 存入数据库
                let resp = service.post('users/addsubscription', {
                  subscription: JSON.stringify(subscription)
                })
              }
            })

          // 用户不同意或者生成失败
            .catch(function (err) {
              weui.topTips(err)
            })
        } else { // 用户已经订阅过
          weui.topTips('已经订阅过')
        }
      })
    }
  } catch (e) {
    // alert(e)
    console.log(e)
  }
})

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
