<template>
  <div class="wrap scale-1px-top">
    <div class="input-content scale-1px">
      <div class="input-wrap">
        <input ref="input" class="weui-input input-inner" maxlength="40" @focus="onfocus"  @blur="onblur" type="text" placeholder="请输入文本">
      </div>
      <div class="face-btn" v-show="false"></div>
      <div class="plus-btn" @click="showPanel" v-show="!option.noPlus"></div>
      <div class="create-btn weui-btn weui-btn_mini weui-btn_primary" @click="publish">发表</div>
    </div>
    <div class="opera-panel" v-show="!option.noPlus">
      <div class="opera-item">
        <div class="item-icon" @click="upload"></div>
        <p class="item-text">照片</p>
        <div style="display:none;" id="uploader">
           <input ref="uploader" id="uploaderInput" class="weui-uploader__input" type="file" accept="image/*" />
       </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCookie } from '@/utils/cookie'
import service from '@/utils/service'
export default {
  name: 'inputbar',
  props: {
    data: Object,
    option: Object
  },
  data () {
    return {
      disabled: false,
      currentData: {},
      uploadCount: 0,
      panelShow: false
    }
  },

  mounted () {
    let self = this
    weui.uploader('#uploader', {
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

        if (['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].indexOf(this.type) < 0) {
          weui.alert('请上传图片')
          return false // 阻止文件添加
        }
        if (this.size > 10 * 1024 * 1024) {
          weui.alert('请上传不超过10M的图片')
          return false
        }
        if (files.length > 1) { // 防止一下子选择过多文件
          weui.alert('最多只能上传1张图片，请重新选择')
          return false
        }

        // return true; // 阻止默认行为，不插入预览图的框架
      },

      onBeforeSend: function (data, headers) {
        // console.log(this, data, headers);
        // $.extend(data, { test: 1 }); // 可以扩展此对象来控制上传参数
        // $.extend(headers, { Origin: 'http://127.0.0.1' }); // 可以扩展此对象来控制上传头部
        headers['wec-access-token'] = getCookie('token')
        // return false; // 阻止文件上传
      },

      onSuccess: function (ret) {
        // 上传图片回调
        self.$emit('uploaded', ret)
        // return true; // 阻止默认行为，不使用默认的成功态
      }
    })
  },
  methods: {
    /*
    * 触发上传操作
    */
    upload () {
      this.$refs.uploader.click()
    },
    /*
    * 发表文字内容回调
    */
    publish () {
      if (this.$refs.input.value) {
        this.$emit('publish', {
          value: this.$refs.input.value,
          data: this.currentData
        })

        this.$refs.input.value = ''
      }
    },
    /*
    * 打开图片操作面板
    */
    showPanel () {
      this.panelShow = true
      this.$emit('showBottom')
    },
    /*
    * 关闭图片操作面板
    */
    closePanel () {
      this.panelShow = false
    },
    /*
    * 让输入框失去焦点，实际上这段代码就会收起键盘
    */
    blurInput () {
      this.$refs.input.blur()
    },
    /*
    * 让输入框获取焦点，实际上这段代码就会呼起键盘
    */
    focusInput (currentData) {
      this.currentData = currentData
      this.$refs.input.focus()
    },
    onblur () {
      setTimeout(() => {
        // 在朋友圈时，失去焦点要关闭评论框
        this.$bus.$emit('showInput', false, this.data)
      }, 90)
    },

    onfocus () {
      // 这段代码用来获取键盘高度，所以必须满足键盘在页面底部noplus代表没有底部的操作面板
      if (!this.option.noPlus) {
        setTimeout(() => {
          // 键盘在页面底部时在获取
          if (!this.panelShow) {
            // 键盘呼起前剪去键盘呼起后
            let kh = window.windowHeightOrgin - window.innerHeight
            if (kh > 0) {
              // 由于一些webview上下底部有导航栏，所以我们需要剪去这部分高度
              window.keyboardHeight = kh - (window.screen.height - window.windowHeightOrgin)
              // weui.toast(window.windowHeightOrgin +'xx'+ window.innerHeight + 'yy'+(window.screen.height - window.windowHeightOrgin))
            }
          }
          // 通知父组件隐藏掉图片操作面板
          this.$emit('hideBottomOnPanel')
        }, 200)
      }
    }

  }
}
</script>

<style scoped>
.wrap {
  background-color: #f6f6f6;

}
.input-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 56px;
}
.opera-panel {
  height: 230px;
  width: 100%;
  display: flex;
}
.opera-item {
  width:66px;
  height:90px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 12px;
}
.item-text {
  color: rgb(133,133,133);
  font-size: 13px;
  margin-top: 7px;
}
.item-icon {
  width:60px;
  height: 60px;
  background-color:#fff;
  background-image: url('./img/photo.png');
  background-size: 26px 26px;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 7px;
}
.face-btn {
  width: 28px;
  height: 28px;
  background-image: url('./img/face.png');
  background-size: cover;
  margin-left: 7px;
}
.plus-btn {
  width: 28px;
  height: 28px;
  background-image: url('./img/plus.png');
  background-size: cover;
  margin-left: 7px;
}
.create-btn {
  margin-left: 7px;
  padding: 0 9px;
  margin-right: 7px;
}
.input-wrap {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  height: 40px;
  margin-left: 11px;
}
.input-inner {
  height: 100%;
  font-size: 18px;
  padding-left: 7px;
  padding-right: 7px;
}

</style>
