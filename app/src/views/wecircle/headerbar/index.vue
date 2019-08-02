
<template>
  <div class="header-bar scale-1px" :class="[headerClass]">
    <p class="title">Wecircle</p>
    <div class="right-icon" @click="goPublish"></div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'headerbar',
  components: {},
  props: {},
  data () {
    return {
      headerClass: ''
    }
  },

  mounted () {
    // 处理评论输入框的现实和隐藏
    this.$bus.$on('showHeader', () => {
      this.headerClass = 'show'
    })

    this.$bus.$on('hideHeader', () => {
      this.headerClass = ''
    })
  },
  methods: {
    goPublish () {
      if (!this.$store.state.currentUser._id) {
        this.$router.push({
          name: 'login'
        })
        return
      }
      this.$router.push({
        name: 'publish'
      })
    }

  }
}
</script>
<style scoped>
.header-bar {
  height: 57px;
  position: fixed;
  width: 100%;
  transition: all 400ms;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
}
.title {
  font-size: 4vw;
  font-weight: bold;
  margin-top: 16px;
  display: none;
}
.header-bar::after {
  display: none;
}
.header-bar.show::after {
  background-color: #ededed;
  display: block;
}
.header-bar.show {
  background-color: #ededed;

}
.header-bar.show .title {
  display: block;
}
.header-bar.show .right-icon {
  background-image: url("./img/photo_a.png");
}
.right-icon {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 17px;
  top: 16px;
  background-image: url("./img/photo.png");
  background-size: cover;
  background-position: center center;
}
</style>
