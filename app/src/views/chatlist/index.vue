
<template>
  <div class="container">
    <navHeader title="我的私信"/>
    <div class="weui-search-bar" id="searchBar" :class="searchBarClass">
      <form class="weui-search-bar__form">
        <div class="weui-search-bar__box">
          <i class="weui-icon-search"></i>
          <input v-model="keyword" type="search" class="weui-search-bar__input" placeholder="搜索" required @input="searchChat($event)">
          <a href="javascript:" @click="clearSearch" class="weui-icon-clear"></a>
        </div>
        <label class="weui-search-bar__label">
          <i class="weui-icon-search"></i>
          <span>搜索</span>
        </label>
      </form>
      <a href="javascript:" class="weui-search-bar__cancel-btn">取消</a>
    </div>
    <div class="content-list">
      <div class="weui-loadmore" v-show="loading">
        <i class="weui-loading"></i>
        <span class="weui-loadmore__tips">正在加载</span>
      </div>
      <div class="weui-loadmore weui-loadmore_line weui-loadmore_dot" v-show="!loading&&dataList.length === 0">
        <span class="weui-loadmore__tips"></span>
      </div>
      <div @click="goChat(item)" class="item" v-for="(item) in dataList" :key="item._id">
        <img :src="item.user.avatar" class="avatar">
        <div class="right-content scale-1px">
          <p class="nickname one-line">{{item.user.nickname}}</p>
          <p v-if="item.msg.content && item.msg.content.type==='str'" class="text one-line">{{item.msg.content.value}}</p>
          <p v-if="item.msg.content && item.msg.content.type==='pic'" class="text one-line">[图片]</p>
        </div>
        <div class="time">{{formatTime(item.msg.create)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import navHeader from '@/components/navHeader'
import formatTime from '@/utils/formatTime'
import service from '@/utils/service'

export default {
  name: 'chatlist',
  components: {
    navHeader
  },
  props: {},
  data () {
    return {
      dataList: [],
      loading: true,
      searchBarClass: ''
    }
  },
  computed: {
    keyword: {
      get: function () {
        return this.$store.state.keyword
      },
      set: function (newValue) {
        // this.$store.state.keyword = newValue;
        // 将keyword放进store保存起来
        this.$store.dispatch('setKeyword', newValue)
      }
    }
  },
  created () {
    // 如果keyword有值，就将search设置为启用状态
    if (this.keyword) {
      this.searchBarClass = 'weui-search-bar_focusing'
    } else {
      this.searchBarClass = ''
    }
    this.fetchData()
  },

  mounted () {
    weui.searchBar('#searchBar')
  },
  methods: {
    clearSearch () {
      this.keyword = ''
      this.fetchData()
    },
    async fetchData () {
      this.loading = true
      let resp = await service.get('message/getchatlist', {
        keyword: this.keyword
      })
      this.loading = false
      if (resp.data !== 0) {
        this.dataList = resp.data
      }
    },
    searchChat () {
      this.fetchData()
    },
    goChat (item) {
      this.$router.push({
        path: '/chat',
        query: {
          id: item.user._id,
          name: item.user.nickname
        }
      })
    },
    formatTime (str) {
      return formatTime(new Date(str).getTime() / 1000)
    }
  }
}
</script>
<style scoped>
.container {
  padding-top: 64px;
}
.item {
  height: 72px;
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
}
.avatar {
  width: 47px;
  height: 47px;
  border-radius: 5px;
  margin: 15px;
}
.right-content {
  flex: 1;
  margin-left: 15px;

  padding-top: 15px;
  padding-bottom: 11px;
  padding-right: 15px;
  overflow: hidden;
}
.nickname {
  font-size: 16px;
  color: #000;
  text-align: left;
}
.text {
  text-align: left;
  font-size: 14px;
  color: #818181;
}
.time {
  position: absolute;
  right: 11px;
  top: 9px;
  color: #a3a3a3;
  font-size: 13px;
}
</style>
