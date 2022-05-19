
<template>
  <div class="container">
    <pullRefreshView @onRefresh="onRefresh">
      <headerbar></headerbar>
      <div class="top-img" :style="topImgStyle" @click="changeBg"></div>
      <div style="display:none;" id="uploaderBg">
        <input
          ref="uploaderBg"
          id="uploaderInput"
          class="weui-uploader__input"
          type="file"
          accept="image/*"
        >
      </div>
      <div class="name-info">
        <p class="nickname">{{nickname}}</p>
        <img @click="goMyPage" class="avatar" :src="myAvatar">
      </div>
      <list ref="list"></list>
      <div :style="{zIndex:showInput?'999':'-1',opacity:showInput?'1':'0'}" ref="inputBarWrap" class="input-wrap ios" v-if="iosInput">
        <inputBar ref="inputBar" :option="inputBarOption" @publish="publish"></inputBar>
      </div>
      <div :style="{opacity:showInput?'1':'0',bottom:showInput?'0':'-60px'}" ref="inputBarWrap" class="input-wrap android" v-if="androidInput">
        <inputBar ref="inputBar" :option="inputBarOption" @publish="publish"></inputBar>
      </div>
    </pullRefreshView>
    <div v-show="showPWA" @click="showPWA = false" class="add-screen"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import list from './list'
import headerbar from './headerbar'
import inputBar from '@/components/inputBar'
import service from '@/utils/service'
import os from '@/utils/os'
import pullRefreshView from '@/components/pullRefreshView'

export default {
  name: 'wecircle',
  components: {
    list,
    headerbar,
    inputBar,
    pullRefreshView
  },
  props: {},
  data () {
    return {
      inputBarOption: {
        noPlus: true
      },
      showInput: false,
      showPWA: !(window.location.href.indexOf('manifest') > -1) && os.isIOS, // 在非pwa页面显示提示
      iosInput: os.isIOS,
      androidInput: os.isAndroid
    }
  },
  asyncData ({ store }) {
    // 触发 action 后，会返回 Promise
    return store.dispatch('setWecircleDataListSSR')
  },
  computed: {
    myAvatar () {
      return (
        this.$store.state.currentUser.avatar ||
        require('../../assets/missing_face.png')
      )
    },
    nickname () {
      return this.$store.state.currentUser.nickname || '游客账号'
    },
    topImgStyle () {
      // 背景图片首先从store里面获取，获取不到就采用默认的背景图片
      let url =
        this.$store.state.currentUser.bgurl ||
        require('../../assets/topbg.jpg')
      let obj = {
        backgroundImage: 'url(' + url + ')'
      }
      return obj
    }
  },
  mounted () {

    // 处理评论输入框的现实和隐藏
    this.$bus.$on('showInput', (flag, currentData) => {
      this.showInput = flag
      if (flag) {
        this.$refs.inputBar && this.$refs.inputBar.focusInput(currentData)

        // 在ios里，页面会被顶上来，要单独处理
        if (os.isIOS) {
          // 设置input在手指点击的那个位置出现10表示稍向下移动一些
          this.$refs.inputBarWrap.style.top = (currentData.pageY) + 'px'

          setTimeout(() => {
            // 输入框的位置剪去键盘的高度剪去位置微调系数45 ： 5
            let y = currentData.pageY - window.keyboardHeight - (os.isIpP ? 45 : 5)
            // weui.toast(window.keyboardHeight)
            // weui.toast(window.innerHeight +'yy'+window.keyboardHeight)

            // 通过调用window.scroll在将页面顶回去一定距离
            window.scroll(0, y)
          }, 300)
        }
      } else {
        try {
          this.$refs.inputBar.blurInput()
        } catch (e) {}
      }
    })
    new Image().src = 'https://www.nihaoshijie.com.cn/rapi/report/create?code=172543'
    var self = this
    weui.uploader('#uploaderBg', {
      url: service.baseURL + 'post/uploadimgaliyun',
      auto: true,
      type: 'file',
      fileVal: 'image',
      compress: {
        width: 1300,
        height: 1300,
        quality: 0.8
      },
      onBeforeQueued: function (files) {
        // `this` 是轮询到的文件, `files` 是所有文件

        if (
          ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].indexOf(
            this.type
          ) < 0
        ) {
          weui.alert('请上传图片')
          return false // 阻止文件添加
        }
        if (this.size > 10 * 1024 * 1024) {
          weui.alert('请上传不超过10M的图片')
          return false
        }
        if (files.length > 1) {
          // 防止一下子选择过多文件
          weui.alert('最多只能上传1张图片，请重新选择')
          return false
        }

        // return true; // 阻止默认行为，不插入预览图的框架
      },
      onBeforeSend: function (data, headers) {
        // console.log(this, data, headers);
        // $.extend(data, { test: 1 }); // 可以扩展此对象来控制上传参数
        // $.extend(headers, { Origin: 'http://127.0.0.1' }); // 可以扩展此对象来控制上传头部
        headers['wec-access-token'] = service.token
        // return false; // 阻止文件上传
      },
      onSuccess: function (ret) {
        // console.log(this, ret)
        // self.$emit('uploaded',ret)
        // return true; // 阻止默认行为，不使用默认的成功态

        self.submitBg(ret)
      }
    })
  },
  methods: {

    onRefresh () {
      this.$refs.list.refresh()
    },
    /*
    * 修改背景图片
    */
    changeBg () {
      // 调用weui的actionSheet方法
      weui.actionSheet(
        [
          {
            label: '更换图片',
            onClick: () => {
              this.$refs.uploaderBg.click()
            }
          }
        ],
        [
          {
            label: '取消',
            onClick: function () {
              // console.log('取消');
            }
          }
        ]

      )
    },
    pxtovw (px) {
      return (px / 375 * 100) + 'vw'
    },

    async publish (data) {
      // 存入数据库
      let resp = await service.post('likecomment/addcomment', {
        content: data.value,
        // userId: this.$store.state.currentUser._id,
        postId: data.data.id
      })

      if (resp.code === 0) {
        // vuex 无刷新更新ui
        this.$store.dispatch('addComment', {
          content: data.value,
          pid: resp.data.post,
          user: this.$store.state.currentUser
        })
        this.showInput = false
      } else {
        weui.alert('评论失败')
      }
    },
    goMyPage () {
      // 判断是否登录
      if (!this.$store.state.currentUser._id) {
        this.$router.push({
          name: 'login'
        })
        return
      }
      this.$router.push({
        name: 'mypage',
        params: {}
      })
    },
    async submitBg (obj) {
      let resp = await service.post('users/update', {
        userId: this.$store.state.currentUser._id,
        bgurl: obj.data.url
      })

      if (resp.code === 0) {
        this.$store.dispatch('setUser', {
          ...this.$store.state.currentUser,
          bgurl: obj.data.url
        })
        weui.toast('修改成功', 3000)
      }
    }
  }
}
</script>
<style scoped>
.name-info {
  position: absolute;
  right: 12px;
  top: 273px;
  border-radius: 5px;
  display: flex;
}
.nickname {
  margin-right: 24px;
  margin-top: 17px;
  color: #fff;
  text-shadow: 1px 1px 2px #000000;
  font-size:16px;
}
.top-img {
  height: 320px;
  width: 100%;
  background-size: cover;
  background-position: center center;
}
.avatar {
  width: 66px;
  height: 66px;
  border-radius: 4px;
}
.input-wrap.ios {
  position: absolute;
  left: 0;
  right: 0;
  top: 80px;
  z-index: -1;
}
.input-wrap.android {
  position: fixed;
  left: 0;
  bottom: -60px;
  right: 0;
  z-index: 999;
}
.add-screen {
  position: fixed;
  bottom: 15px;
  left:50%;
  width: 300px;
  height: 166px;

  background-image: url('//wecircle.oss-cn-beijing.aliyuncs.com/image-1560843180441.PNG?x-oss-process=image/resize,l_300');
  background-size: cover;
  transform: translateX(-50%);
  z-index: 999;
  border: 1px solid #ccc;
}
</style>
