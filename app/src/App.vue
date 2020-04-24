/* eslint-disable */
<template>
  <div id="app">
    <transition :enter-active-class="transitionNameIn" :leave-active-class="transitionNameOut" :duration="duration"
      @beforeEnter="beforeEnter" @afterEnter="afterEnter">
      <router-view></router-view>
    </transition>
  </div>
</template>
<script>
import os from './utils/os'
export default {
  name: 'App',
  data () {
    return {
      transitionNameOut: '',
      transitionNameIn: '',
      duration: ''
    }
  },
  mounted () {
    weui.dialog({
      title: '请注意',
      content: '本页面只作为专栏项目的demo展示，请勿发布非法内容！',
      className: 'custom-classname',
      buttons: [{
        label: '取消',
        type: 'default',
        onClick: function () { }
      }, {
        label: '确定',
        type: 'primary',
        onClick: function () { }
      }]
    })
    window.windowHeightOrgin = window.innerHeight
    window.keyboardHeight = os.getKeyBoardHeightDefault() - (window.screen.height - window.windowHeightOrgin)
  },
  methods: {
    beforeEnter () {
      // document.body.style.overflow = 'hidden';
    },
    afterEnter () {
      // document.body.style.overflow = 'visible';
    }
  },
  watch: {// 使用watch 监听$router的变化
    $route (to, from) {
      // 持续时间
      this.duration = 500
      // 从下往上切换
      if (to.name === 'publish' || to.name === 'login') {
        this.transitionNameIn = 'animated faster slideInUp'
        this.transitionNameOut = 'slideOutIng'
      } else if (from.name === 'publish' || from.name === 'login') {
        this.transitionNameIn = ''
        this.transitionNameOut = 'animated faster slideOutDown'
      } else { // 从左往右切换
        // 后退
        if (this.$router.backFlag) {
          this.transitionNameOut = 'animated faster slideOutRight'
          this.transitionNameIn = 'animated faster slideInLeft'
        } else { // 前进
          this.transitionNameIn = 'animated faster slideInRight'
          this.transitionNameOut = 'animated faster slideOutLeft'
        }
      }
      // 重置返回的标志位
      this.$router.backFlag = false
    }
  }
}
</script>

<style>
.slideOutIng {
  position: absolute;
  left: 0;
  right: 0;
}

</style>
