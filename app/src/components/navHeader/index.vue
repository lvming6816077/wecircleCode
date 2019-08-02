
<template>
  <div class="header-bar scale-1px">
    <p class="title">{{title}}</p>
    <div class="left-icon" @click="goBack"></div>
  </div>
</template>

<script>

export default {
  name: 'navHeader',

  props: {
    title: String
  },

  methods: {
    goBack () {
      // 表示是返回的标志位
      this.$router.backFlag = true
      this.$router.back()
    }
  }
}
</script>
<style scoped>
.header-bar {
  height: 64px;
  position: fixed;
  width: 100%;
  top:0;
  background-color: #eee;
  transform: translate3d(0,0,1px);
  z-index: 120;
}
.left-icon {
  width: 24px;
  height: 24px;
  position: absolute;
  left: 17px;
  top:18px;
  background-image:url('./img/back.png');
  background-size: cover;
  background-position: center center;
}
.title {
  height: 100%;
  line-height: 64px;
  font-size: 17px;
  font-weight: bold;
}
</style>
