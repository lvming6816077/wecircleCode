
<template>
  <div class="container">
    <navHeader title="修改个性签名"/>
    <div class="weui-cell">
        <div class="weui-cell__bd">
            <input class="weui-input" type="text" placeholder="请输入文本" v-model="desc" maxLength="20">
        </div>
    </div>
    <div class="weui-btn-area">
        <a class="weui-btn weui-btn_primary" href="javascript:" id="showTooltips" @click="submit">确定</a>
    </div>
  </div>
</template>

<script>

import navHeader from '@/components/navHeader'

import service from '@/utils/service'
export default {
  name: 'changedesc',
  components: {
    navHeader
  },
  data () {
    return {
      desc: this.$route.params.desc || ''
    }
  },
  methods: {
    async submit () {
      let resp = await service.post('users/update', {
        userId: this.$store.state.currentUser._id,
        desc: this.desc
      })

      if (resp.code === 0) {
        this.$store.dispatch('setUser', {
          ...this.$store.state.currentUser,
          desc: this.desc
        })

        weui.toast('修改成功', 1000)
        setTimeout(() => {
          this.$nextTick(() => {
            this.$router.backFlag = true
            this.$router.back()
          })
        }, 400)
      }
    }
  }
}
</script>
<style scoped>
.container {
  padding-top: 64px;
}
.weui-cell {
  border-bottom: 1px solid #e5e5e5;
}
</style>
