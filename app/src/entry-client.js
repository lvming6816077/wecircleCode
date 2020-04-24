import { createApp } from './main_ssr'

import './registerServiceWorker'

// 客户端特定引导逻辑……

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
// console.error(app)
router.onReady(() => {
  // console.log('xxx')
  app.$mount('#app')
})
