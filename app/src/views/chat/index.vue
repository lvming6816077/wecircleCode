
<template>
  <div class="container">
    <navHeader :title="topName"/>
    <div ref="chatView" class="chat-view" @touchstart="touchstart">
      <chatItem v-for="(item) in dataList" :data="item" :key="item._id"/>
    </div>
    <div :class="bottomClass" :style="bottomStyle">
      <inputBar
        ref="inputBar"
        :option="{}"
        @publish="publish"
        @uploaded="uploaded"
        @showBottom="showBottom"
        @hideBottom="hideBottom"
        @hideBottomOnPanel="hideBottomOnPanel"
      />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import inputBar from '@/components/inputBar'
import navHeader from '@/components/navHeader'
import chatItem from '@/components/chatItem'
import service from '@/utils/service'
import os from '@/utils/os'
export default {
  name: 'chat',
  components: {
    navHeader,
    inputBar,
    chatItem
  },
  props: {},
  data () {
    return {
      bottomClass: 'bottom-view',
      bottomStyle: '',
      topName: this.$route.query.name || '',
      toUserId: this.$route.query.id,
      dataList: []
    }
  },

  created () {
    if (this.$store.state.currentUser && this.$store.state.currentUser._id) {
      this.$socket.emit('login', this.$store.state.currentUser)
    }

    this.fetchData()
    // this.loopFlag = setInterval(() => {
    //   this.fetchData()
    // }, 2001)
  },
  beforeDestroy () {
    // window.clearInterval(this.loopFlag)
    if (this.$store.state.currentUser && this.$store.state.currentUser._id) {
      this.$socket.emit('loginout', this.$store.state.currentUser)
    }
  },
  sockets: {
    /*
    * 接收到消息
    */
    recieveMsg: function (obj) {
      // 将接收到的消息push到当前的list中
      if (obj.fromUser._id === this.toUserId) {
        this.afterCommit({
          content: obj.content,
          fromUser: obj.fromUser
        })
      }
    },
    /*
    * 服务端掉线之后客户端会自动重连，此事件在重连成功时触发
    */
    reconnect: function (obj) {
      // 后端重启之后需要重新登录一次
      if (this.$store.state.currentUser && this.$store.state.currentUser._id) {
        this.$socket.emit('login', this.$store.state.currentUser)
      }
    }
  },
  methods: {
    async fetchData () {
      let resp = await service.get('message/getchathistory', {
        toUser: this.toUserId
      })

      // this.$store.dispatch('setChatHistoryList',resp.data);
      this.dataList = resp.data
    },

    scrollToEnd (immediate) {
      let ele = this.$refs.chatView
      if (immediate) {
        ele.scrollTop = ele.scrollHeight
        return
      }
      setTimeout(() => {
        ele.scrollTop = ele.scrollHeight
      }, 200)
    },
    afterCommit (obj) {
      this.dataList.push(obj)
      this.$nextTick(() => {
        this.scrollToEnd()
      })
    },
    async publish (obj) {
      if (!obj.value) return
      let o = {
        toUser: this.toUserId,
        content: { type: 'str', value: obj.value }
      }
      let resp = await service.post('message/addmsg', o)

      this.afterCommit({
        content: { type: 'str', value: obj.value },
        fromUser: this.$store.state.currentUser,
        mine: true
      })
      if (resp.code !== 0) {
        weui.topTips('发送失败')
      }
    },
    async uploaded (obj) {
      let o = {
        toUser: this.toUserId,
        content: { type: 'pic', value: obj.data }
      }
      let resp = await service.post('message/addmsg', o)

      this.afterCommit({
        content: { type: 'pic', value: obj.data },
        fromUser: this.$store.state.currentUser,
        mine: true
      })
      if (resp.code !== 0) {
        weui.topTips('发送失败')
      }
    },

    closePanel () {
      this.bottomStyle = ''
      this.bottomClass = this.bottomClass.replace(' show', '')
      this.$refs.inputBar.closePanel()
    },
    touchstart () {
      this.closePanel()
      this.$refs.inputBar.blurInput()
    },
    pxtovw (px) {
      return (px / 375 * 100) + 'vw'
    },
    /*
    * 显示图隐藏片操作面板
    */
    showBottom () {
      if (this.bottomClass.indexOf('show') > -1) {
        this.bottomStyle = ''
        // this.bottomClass = this.bottomClass.replace(' show','');
      } else {
        this.bottomClass += ' show'
      }
    },
    /*
    * 正常情况下，直接隐藏输入框即可
    */
    hideBottom () {
      this.closePanel()
    },
    /*
    * 在图片操作面板处于展开状态时的处理逻辑
    */
    hideBottomOnPanel (h) {
      // 将聊天界面滚动到底部，看到最新的聊天内容
      this.scrollToEnd(true)

      // 此时图片操作面板处于展开状态时
      if (this.bottomClass.indexOf('show') > -1) {
        if (os.isIOS) {
          // 将页面在顶回去
          window.scroll(0, 70) // 键盘高度-图片操作面板高度+输入框高度
        } else {
          // Android无需修改，直接将图片操作面板隐藏即可
          this.closePanel()
        }
      }
    }
  }
}
</script>
<style scoped>
.container {
  display: flex;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  flex-direction: column;
}
.bottom-view {
  width: 100%;
  height: 56px;

  overflow: hidden;
  transition: height 200ms;
}
.bottom-view.show {
  width: 100%;
  height: 285px;
}
.chat-view {
  padding-top: 64px;
  flex: 1;
  background-color: rgb(237, 237, 237);

  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 30px;
}
</style>
