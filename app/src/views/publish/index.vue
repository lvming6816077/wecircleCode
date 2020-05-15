
<template>
  <div class="container">
    <div class="header">
      <div class="cancel" @click="cancel">取消</div>
      <div class="create weui-btn weui-btn_mini weui-btn_primary" @click="publish">发表</div>
    </div>
    <div class="input-content">
      <textarea
        class="weui-textarea"
        @input="oninput"
        placeholder="这一刻的想法.."
        v-model="content"
        maxlength="70"
      ></textarea>
      <div class="weui-textarea-counter">
        <span>{{this.textCount}}</span>/70
      </div>
    </div>
    <ul class="img-content">
      <div id="uploaderPub">
        <div class="weui-uploader">
          <div class="weui-uploader__bd">
            <ul class="weui-uploader__files" id="uploaderFiles" @click="showImg($event)"></ul>
            <div class="weui-uploader__input-box">
              <input
                id="uploaderInputPub"
                class="weui-uploader__input"
                type="file"
                accept="image/*"
                multiple="multiple"
              >
            </div>
          </div>
          <div class="weui-uploader__hd">
            <div class="weui-uploader__info">
              <span id="uploadCount">{{uploadCount}}</span>/5
            </div>
          </div>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src

import service from '@/utils/service'
import { getCookie } from '@/utils/cookie'

export default {
  name: 'publish',
  components: {},
  props: {},
  data () {
    return {
      uploadCount: 0,
      content: '',
      textCount: 0,
      picList: []
    }
  },
  mounted () {
    let self = this
    weui.uploader('#uploaderPub', {
      url: service.baseURL + 'post/uploadimgaliyun', // 上传服务的后台接口，返回值需要使用json格式
      auto: true, // 选择完图片后立刻上传
      type: 'file', // 上传类型, file为文件上传; base64为以base64上传
      fileVal: 'image', // 文件上传域的name，这里的配置和后台接收上传图片的字段保持一致
      compress: {// 压缩配置
        width: 1300, // 图片的最大宽度
        height: 1300, // 图片的最大高度
        quality: 0.8// 压缩质量, 取值范围 0 ~ 1
      },
      onBeforeQueued: function (files) {
        // `this` 是轮询到的文件, `files` 是所有文件
        if (
          ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].indexOf(
            this.type
          ) < 0// 只允许上传这几个类型的图片
        ) {
          weui.alert('请上传图片')
          return false // 阻止文件添加
        }
        if (this.size > 10 * 1024 * 1024) {
          weui.alert('请上传不超过10M的图片')
          return false
        }
        if (files.length > 5) {
          // 防止一下子选择过多文件
          weui.alert('最多只能上传5张图片，请重新选择')
          return false
        }
        if (self.uploadCount + 1 > 5) {
          weui.alert('最多只能上传5张图片')
          return false
        }
        // 已经上传的图片个图
        ++self.uploadCount

        // return true; // 阻止默认行为，不插入预览图的框架
      },
      onBeforeSend: function (data, headers) {
        // console.log(this, data, headers);
        // 将token字段放在headers里，API校验
        headers['wec-access-token'] = getCookie('token')

        // return false; // 阻止文件上传
      },
      onProgress: function (procent) {
        // console.log(this, procent);
        // return true; // 阻止默认行为，不使用默认的进度显示

      },
      onSuccess: function (ret) {
        // console.log(this, ret)

        ret.data.id = this.id // ret.data是后台上传接口的返回json的数据
        // 将选择的图片放在一个self.picList数组里
        self.picList.push(ret.data)
        // return true; // 阻止默认行为，不使用默认的成功态
      },
      onError: function () {

        // console.log(this, err);
        // return true; // 阻止默认行为，不使用默认的失败态
      }
    })
  },
  methods: {
    oninput () {
      this.textCount = this.content.length
    },
    /*
    * 点击已经上传的预览图
    */
    showImg (e) {
      let target = e.target

      if (target.classList.contains('weui-uploader__file')) {
        // 找到点击的那个dom元素
        let url = target
        // 通过正则找到绑定在background-image上的图片url
          .getAttribute('style')
          .match(/url\((.*?)\)/)[1]
          .replace(/"/g, '')

        // 调用weui的gallery组件查看大图和是否删除的按钮
        let gallery = weui.gallery(url, {
          onDelete: () => {
            // 将删除的图片从已经上传的列表里删除
            this.deleteImg(target, gallery)
          }
        })
      }
    },
    cancel () {
      this.$router.go(-1)
    },
    /*
    * 删除已上传的图片
    */
    deleteImg (target, gallery) {
      // 从target上得到点击的那个图片的id序号
      let id = target.getAttribute('data-id')
      // 删除前给一个确认提示
      if (confirm('确定删除该图片？')) {
        console.log('删除')
      }
      // 从self.picList数组里找到这个图片并删除
      for (var i = 0, len = this.picList.length; i < len; ++i) {
        var file = this.picList[i]
        if (file.id == id) {
          this.picList.splice(i - 1, 1)
          break
        }
      }
      // 将图片的dom移除
      target.remove()
      // 隐藏gallert图片查看器
      gallery.hide()
      // 已上传图片个数减1
      this.uploadCount--
    },
    async publish () {
      if (!this.content) {
        return
      }
      let resp = await service.post('post/savepost', {
        content: this.content,
        picList: this.picList
      })

      if (resp.code === 0) {
        this.$router.go(-1)
        this.$router.justPub = true
      }
    }
  }
}
</script>
<style scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 999;
}
.header {
  height: 64px;
  width: 100%;
}
.cancel {
  position: absolute;
  left: 16px;
  top: 17px;
  font-size: 16px;
}
.create {
  position: absolute;
  right: 16px;
  top: 17px;
  width: 60px;
  height: 28px;
  font-size: 12px;
}
.input-content {
  padding: 22px;
}
.img-content {
  overflow: hidden;
  margin-left: 16px;
  margin-top: 22px;
}
.weui-textarea {
  font-size: 16px;
}
</style>
