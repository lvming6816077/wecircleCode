import Vue from 'vue'
import Vuex from 'vuex'
import service from '@/utils/service'
import formatTime from '@/utils/formatTime'
Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production', // 严格模式，只能用action来修改state
    state: {
      // 存储当前用户的数据
      currentUser: window.localStorage.getItem('cuser') ? JSON.parse(window.localStorage.getItem('cuser')) : {},
      // 朋友圈首页的数据
      wecircleDataList: [],
      // 关闭评论和点赞面板标志位
      closeCLPanelFlag: true,
      // 私信列表搜索
      keyword: '',

      wecirclePage: 0
    },
    mutations: {
      /*
      * 设置当前用户mutations
      */
      currentUser (state, user) {
        state.currentUser = user
        // 将当前用户数据储存在localStorage里
        window.localStorage.setItem('cuser', JSON.stringify(user))
      },
      /*
      * 朋友圈数据列表mutations
      */
      wecircleDataList (state, list) {
        if (list.first) {
          state.wecircleDataList = []
        } else {
          state.wecircleDataList = state.wecircleDataList.concat(list)
        }

      },

      wecirclePage (state, page) {
        state.wecirclePage = page
      },
      /*
      * 添加评论mutations
      */
      addComment (state, obj) {
        var list = state.wecircleDataList
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === obj.pid) {
            list[i].comments.push({
              content: obj.content,
              user: obj.user
            })
          }
        }
      },
      /*
      * 添加点赞mutations
      */
      addLike (state, obj) {
        var list = state.wecircleDataList
        // 在wecircleDataList里找到当前点赞的那个post，然后修改lists字段
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === obj.pid) {
            list[i].isLike = true
            list[i].likes.push({
              user: obj.user
            })
          }
        }
      },
      /*
      * 取消点赞mutations
      */
      removeLike (state, obj) {
        var list = state.wecircleDataList
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === obj.pid) {
            list[i].isLike = false
            var array = []
            for (var j = 0; j < list[i].likes.length; j++) {
              if (list[i].likes[j].user._id !== obj.user._id) {
                array.push(list[i].likes[j])
              }
            }
            list[i].likes = array
          }
        }
      },
      /*
      * 关闭评论点赞面板mutations
      */
      closeCLPanel (state, obj) {
        state.closeCLPanelFlag = obj
      },
      /*
      * 设置搜索关键字mutations
      */
      setKeyword (state, str) {
        state.keyword = str
      }
    },
    actions: {
      setUser (context, user) {
        // 增加action
        context.commit('currentUser', user)
      },
      setWecircleDataList (context, list) {
        context.commit('wecircleDataList', list)
      },
      setWecircleDataListSSR (context) {
        return service.getNoHeader('post/getcirclepost', {
          pageStart: 0
        }).then((resp)=>{

          let array = []
          resp.data.forEach(item => {
            array.push({
              id: item._id, // post的id
              avatar: item.user.avatar, // 头像url
              nickname: item.user.nickname, // 昵称
              content: item.content, // 内容
              piclist: item.picList, // 图片内容
              comments: item.comments, // 评论数据
              time: formatTime(new Date(item.create).getTime() / 1000), // 将后台返回的GMT时间转变成本地时间
              isLike: item.isLike, // 是否本人已经点赞
              likes: item.likes, // 点赞的数据
              user: item.user// 发表者的数据
            })
          })
          context.commit('wecircleDataList', array)
          context.commit('wecirclePage', 1)
        })

      },
      addComment (context, obj) {
        context.commit('addComment', obj)
      },
      addLike (context, obj) {
        context.commit('addLike', obj)
      },
      removeLike (context, obj) {
        context.commit('removeLike', obj)
      },
      setKeyword (context, str) {
        context.commit('setKeyword', str)
      },
      closeCLPanel (context, obj) {
        context.commit('closeCLPanel', obj)
      },
      setWecirclePage (context, obj) {
        context.commit('wecirclePage', obj)
      }
    }
  })
}
