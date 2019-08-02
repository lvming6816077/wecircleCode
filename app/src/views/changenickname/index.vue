
<template>
  <div class="container">
    <navHeader title="修改昵称"/>
    <div class="weui-cell">
        <div class="weui-cell__bd">
            <input class="weui-input" type="text" placeholder="请输入文本" v-model="name" maxLength="15">
        </div>
    </div>
    <div class="weui-btn-area">
        <a class="weui-btn weui-btn_primary" href="javascript:" id="showTooltips" @click="submit">确定</a>
    </div>
  </div>
</template>

<script>

import navHeader from '@/components/navHeader'
import { getCookie } from '@/utils/cookie'
import service from '@/utils/service'
export default {
  name: 'changenickname',
  components: {
    navHeader
  },
  data () {
  	return {
      name: this.$route.params.name || ''
  	}
  },

  methods: {
    async submit () {
      let resp = await service.post('users/update', {
        userId: this.$store.state.currentUser._id,
        nickname: this.name
      })

      if (resp.code === 0) {
        this.$store.dispatch('setUser', {
          ...this.$store.state.currentUser,
          nickname: this.name
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
