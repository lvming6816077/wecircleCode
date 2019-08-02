
<template>
  <div class="container">
    <navHeader title="个人信息"/>
    <div class="weui-cells content">
      <div class="panel">
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="changeAvatar">
          <div class="weui-cell__bd">
            <p class="name">头像</p>
            <div style="display:none" id="uploaderMyAvatar">
              <input
                ref="uploaderInputAvatar"
                id="uploaderInputAvatar"
                class="weui-uploader__input"
                type="file"
                accept="image/*"
              >
            </div>
          </div>
          <img class="avatar" :src="myUser.avatar">
          <div class="weui-cell__ft"></div>
        </a>
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="goChangeName">
          <div class="weui-cell__bd">
            <p class="name">名字</p>
          </div>
          <div class="weui-cell__ft">{{myUser.nickname}}</div>
        </a>
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="goChangeDesc">
          <div class="weui-cell__bd">
            <p class="name">个性签名</p>
          </div>
          <div class="weui-cell__ft">{{myUser.desc}}</div>
        </a>
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="goChangeGender">
          <div class="weui-cell__bd">
            <p class="name">性别</p>
          </div>
          <div class="weui-cell__ft">{{myUser.gender == 1 ? '男':'女'}}</div>
        </a>
        <a class="weui-cell weui-cell_access" href="javascript:;">
          <div class="weui-cell__bd">
            <p class="name">电话号码</p>
          </div>
          <div class="weui-cell__ft phone">{{myUser.phoneNum}}</div>
        </a>
      </div>
      <div class="panel">
        <a class="weui-cell weui-cell_access" href="javascript:;" @click="goChat">
          <div class="weui-cell__bd">
            <p class="name msg">私信</p>
          </div>
          <div class="weui-cell__ft"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import navHeader from '@/components/navHeader'
import { getCookie } from '@/utils/cookie'
import service from '@/utils/service'
export default {
  name: 'mypage',
  components: {
    navHeader
  },
  props: {},
  data () {
    return {}
  },
  computed: {
    myUser () {
      return this.$store.state.currentUser
    }
  },
  async created () {
    let resp = await service.get('users/userinfo', {
      userId: this.$store.state.currentUser._id
    })

    if (resp.code === 0 && !this.myUser.avatar) {
      this.myUser = resp.data
    }
  },
  mounted () {
    let self = this
    weui.uploader('#uploaderMyAvatar', {
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

        if (
          ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].indexOf(
            this.type
          ) < 0
        ) {
          weui.alert('请上传图片')
          return false // 阻止文件添加
        }
        if (this.size > 10 * 1024 * 1024) {
          weui.alert('请上传不超过10M的图片')
          return false
        }
      },

      onBeforeSend: function (data, headers) {
        // console.log(this, data, headers);
        // $.extend(data, { test: 1 }); // 可以扩展此对象来控制上传参数
        // $.extend(headers, { Origin: 'http://127.0.0.1' }); // 可以扩展此对象来控制上传头部
        headers['wec-access-token'] = getCookie('token')
        // return false; // 阻止文件上传
      },
      onSuccess: function (ret) {
        self.changeAvatarCallback(ret)
        // return true; // 阻止默认行为，不使用默认的成功态
      }
    })
  },

  methods: {
    /*
    * 修改头像
    */
    async changeAvatarCallback (obj) {
      // console.log(obj)
      let resp = await service.post('users/update', {
        userId: this.myUser._id,
        avatar: obj.data.url
      })

      if (resp.code === 0) {
        // 修改成功之后要通知vuex来更新store的数据
        this.$store.dispatch('setUser', {
          ...this.myUser,
          avatar: obj.data.url
        })

        weui.toast('修改成功', 1000)
      }
    },
    changeAvatar () {
      this.$refs.uploaderInputAvatar.click()
    },
    /*
    * 修改性别
    */
    async changeGender (gender) {
      let resp = await service.post('users/update', {
        userId: this.myUser._id,
        gender: gender
      })
      // 修改成功之后要通知vuex来更新store的数据
      if (resp.code === 0) {
        this.$store.dispatch('setUser', {
          ...this.myUser,
          gender: gender
        })
        weui.toast('修改成功', 1000)
      }
    },
    goChangeGender () {
      weui.actionSheet(
        [
          {
            label: '男',
            onClick: () => {
              this.changeGender(1)
              // console.log('拍照');
            }
          },
          {
            label: '女',
            onClick: () => {
              this.changeGender(0)
              // console.log('拍照');
            }
          }
        ],
        [
          {
            label: '取消',
            onClick: function () {
              // console.log('取消');
            }
          }
        ]
      )
    },
    goChangeName () {
      this.$router.push({
        name: 'changenickname',
        params: {
          name: this.myUser.nickname
        }
      })
    },
    goChangeDesc () {
      this.$router.push({
        name: 'changedesc',
        params: {
          desc: this.myUser.desc
        }
      })
    },

    goChat () {
      this.$router.push({
        name: 'chatlist',
        params: {}
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
  width: 64px;
  height: 64px;
  border-radius: 6px;
  margin-right: 7px;
}
.name {
  text-align: left;
}
.msg {
  text-align: center;
}
.phone.weui-cell__ft::after {
  display: none;
}
</style>
