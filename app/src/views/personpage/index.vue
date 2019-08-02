
<template>
  <div class="container">
    <navHeader title="个人信息"/>
    <div class="weui-cells content">
      <div class="panel person-info">
        <a class="weui-cell" href="javascript:;">
          <img class="avatar" @click="showAvatar(currentUser.avatar)" :src="currentUser.avatar">
          <div class="person-info-right">
            <p :class="currentUser.gender == '1' ? 'male nickname' : 'female nickname' ">{{currentUser.nickname}}</p>
            <p class="phone">Tel:{{currentUser.phoneNum}}</p>
          </div>
        </a>
        <a v-if="currentUser.desc" class="weui-cell weui-cell_access" href="javascript:;" @click="goChat">
          <div class="weui-cell__bd">
            <p class="desc">个性签名</p>
          </div>
          <div class="desc-text">{{currentUser.desc}}</div>
        </a>
      </div>
      <div class="panel">
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="goChat">
          <div class="weui-cell__bd">
            <div class="send-msg">
              <div class="msg-icon"></div>
              <span>发消息</span>
            </div>
          </div>
          <div class="weui-cell__ft"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import navHeader from '@/components/navHeader'
import service from '@/utils/service'

export default {
  name: 'personpage',
  components: {
    navHeader
  },
  props: {},
  data () {
    return {
      currentUser: {}
    }
  },
  async created () {
    let resp = await service.get('users/userinfo', {
      userId: this.$route.query.id
    })

    if (resp.code === 0) {
      this.currentUser = resp.data
    }
  },

  methods: {
    showAvatar (url) {
      // 初始化Slider 实例

      new Slider({
        list: [{ img: url, width: 300, height: 300 }],
        page: 0
      })
    },
    goChat () {
      // 如果没有登录态 跳转登录
      if (!this.$store.state.currentUser._id) {
        this.$router.push({
          name: 'login'
        })
        return
      }
      this.$router.push({
        path: '/chat',

        query: {
          id: this.currentUser._id,
          name: this.currentUser.nickname
        }
      })
    }
  }
}
</script>
<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ededed;
}
.nickname {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  position: relative;
  display: inline-block;
}
.phone {
  font-size: 14px;
  color: #727272;
}
.nickname::after {
  content: "";
  display: block;
  width: 15px;
  height: 15px;
  position: absolute;
  background-size: cover;
  right: -20px;
  top: 4px;
}
.male::after {
  background-image: url("./img/man.png");
}
.female::after {
  background-image: url("./img/female.png");
}
.content {
  margin-top: 64px;
  background-color: #ededed;
  min-height: 400px;
}
.content::before {
  display: none;
}
.panel {
  background-color: #fff;
  margin-bottom: 10px;
}
.panel:last-child {
  margin-bottom: 0px;
}
.cell__ft {
  color: #7f7f7f;
}
.avatar {
  display: block;
  width: 65px;
  height: 65px;
  border-radius: 6px;
  margin-right: 24px;
  margin-left: 10px;
}
.person-info {
  text-align: left;
}
.name {
  color: #576b95;
}
.msg-icon {
  display: inline-block;
  margin-right: 0.8vw;
  width: 20px;
  height: 20px;
  background-size: cover;
  vertical-align: -3px;
  background-image: url("./img/message.png");
}
.desc {
  padding-left: 10px;
}
.desc-text {
  color: #999;
}
</style>
