import Vue from 'vue'
import Router from 'vue-router'
import wecircle from './views/wecircle'
import publish from './views/publish'
import login from '@/components/login'
import mypage from './views/mypage'
// import chat from './views/chat'
import personpage from './views/personpage'
// import chatlist from './views/chatlist'
// import changenickname from './views/changenickname'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
  
Vue.use(Router)

export function createRouter () {

  const router = new Router({
    mode: 'history',
    routes: [

      {
        path: '/',
        name: 'wecircle',
        component: wecircle
      },
      {
        path: '/publish',
        name: 'publish',
        component: publish

        // component: () => import(/* webpackChunkName: "publish" */ './views/publish')
      },
      {
        path: '/mypage',
        name: 'mypage',
        component: mypage
        // component: () => import(/* webpackChunkName: "mypage" */ './views/mypage')
      },
      {
        path: '/login',
        name: 'login',
        component: login
        // component: () => import(/* webpackChunkName: "login" */ '@/components/login')
      },
      {
        path: '/chat',
        name: 'chat',
        component: () => import(/* webpackChunkName: "chat" */ './views/chat')
      },
      {
        path: '/chatlist',
        name: 'chatlist',
        component: () => import(/* webpackChunkName: "chatlist" */ './views/chatlist')
      },
      {
        path: '/personpage',
        name: 'personpage',
        component: personpage
        // component: () => import(/* webpackChunkName: "personpage" */ './views/personpage')
      },
      {
        path: '/changenickname',
        name: 'changenickname',
        component: () => import(/* webpackChunkName: "changenickname" */ './views/changenickname')
      },
      {
        path: '/changedesc',
        name: 'changedesc',
        component: () => import(/* webpackChunkName: "changenickname" */ './views/changedesc')
      }

      // {
      //   path: '/about',
      //   name: 'about',
      //   // route level code-splitting
      //   // this generates a separate chunk (about.[hash].js) for this route
      //   // which is lazy-loaded when the route is visited.
      //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
      // }
    ],
    // scrollBehavior (to, from, savedPosition) {
    //   if (savedPosition) {
    //     return savedPosition
    //   } else {
    //     return { x: 0, y: 0 }
    //   }
    // }
  })

  // router.beforeEach((to,from,next)=>{

    
  //   console.error(to)
  //   console.error(from)
  //   // if (to.path == '/index.html') {
  //   //   next('/')
  //   // } else {
      
  //   // }
  //   next()
    
  // })






  return router
}
