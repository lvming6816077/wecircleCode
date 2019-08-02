<template>
  <div :class="data.mine ? 'chat-item chat-item-mine':'chat-item'">
    <img class="avatar" :src="data.fromUser.avatar" />
    <div class="right-content">
      <p class="nickname one-line">{{data.fromUser.nickname}}</p>
      <div v-if="data.content.type === 'str'" class="chat-text left-arrow">{{data.content.value}}</div>
      <img v-if="data.content.type === 'pic'" @click="showImage(data.content.value)" class="chat-image" :style="imgOneStyle(data.content.value)" :src="getImageUrl(data.content.value.url)" />
    </div>
  </div>

</template>

<script>
export default {
  name: 'chatItem',
  props: {
    data: Object
  },
  methods: {
    showImage (item) {
      // 初始化Slider 实例
      new Slider({
        list: [{
          img: item.url,
          height: item.size.height,
          width: item.size.weight
        }],
        page: 0
      })
    },
    getImageUrl (val) {
      let _url = val + '?x-oss-process=image/resize,l_300'// 500,400,300,200,100...文档地址：https://help.aliyun.com/document_detail/44688.html
      return _url
    },
    pxtovw (px) {
      return (px / 375 * 100) + 'vw'
    }

  },
  computed: {
    /*
    * 单图样式
    */
    imgOneStyle () {
      return item => {
        let height = null
        let width = null
        // 如果图片是长图则给定最大的长度
        if (item.size.height > item.size.width) {
          height = Math.min(120, item.size.height)
          // 根据比例设置宽度
          width = height * item.size.width / item.size.height
        } else { // 如果图片是宽图则给定固定的宽度
          width = Math.min(120, item.size.width)
          // 根据比例设置高度
          height = width * item.size.height / item.size.width
        }
        // 转换成vw单位
        return {
          height: this.pxtovw(height),
          width: this.pxtovw(width)
        }
      }
    }
    // imgOneStyle () {
    //   return (size) => {
    //     // item.size.height > item.size.width
    //     if (size.height > size.width) {
    //       return 'chat-image max-width'
    //     } else {
    //       return 'chat-image max-height'
    //     }
    //   }
    // }
  }
}
</script>

<style scoped>
.chat-item {
  display: flex;
  margin-top: 20px;
}
.avatar {
  width: 41px;
  height: 41px;
  border-radius: 4px;
  margin-left: 12px;
  margin-right: 12px;
}
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.chat-item-mine {
  flex-direction: row-reverse;
}
.chat-item-mine .right-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.chat-item-mine .chat-text {
  background-color:#94eb68;
}
.chat-text {
  color: rgb(15,15,15);
  background-color: #fff;
  text-align: left;
  min-height: 40px;
  border-radius: 4px;
  font-size: 15px;
  position: relative;
  padding: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
  width: auto;
  max-width: 200px;
  word-break: break-all;
}
.chat-image {
  border: .5px solid #ccc;
  display: block;
  border-radius: 3px;
  margin-top: 3px;
  background-color: #e9e9e9;
}

.chat-item-mine .left-arrow::after {
  content: '';
  position: absolute;
  width:0;
  height:0;
  top: 7px;
  right: -8px;
  left: auto;
  border-top:5px solid transparent;
  border-bottom:5px solid transparent;
  border-left:10px solid #94eb68;
}
.chat-item-mine .left-arrow::before {
  display:none;
}
.left-arrow::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 7px;
  width:0;
  height:0;
  border-top:5px solid transparent;
  border-bottom:5px solid transparent;
  border-right:10px solid #fff;
}
.nickname {
  color: rgb(103,103,103);
  font-size: 12px;
  text-align: left;
  max-width: 143px;
}

</style>
