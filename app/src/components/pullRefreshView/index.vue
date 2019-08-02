<template>

  <div class="pullRefreshView" @touchmove="touchmove" @touchstart="touchstart" @touchend="touchend">
    <div ref="circleIcon" class="circle-icon">
      <div ref="circleIconInner" class="circle-icon-inner"></div>
    </div>
    <slot></slot>

  </div>
</template>

<script>
export default {
  name: 'pullRefreshView',

  data () {
    return {
      pullRefresh: {
        dragStart: null, // 开始抓取标志位
        percentage: 0, // 拖动量的百分比
        dragThreshold: 0.3, // 临界值，
        moveCount: 200, // 位移系数，可以调节圆形图片icon运动的速率
        joinRefreshFlag: null // 进入刷新状态标志位，为了在touchend时有标示可以判断

      }
    }
  },
  methods: {
    touchstart (evt) {
      // 手指接触屏幕起始时，记录一下位置
      this.pullRefresh.dragStart = evt.targetTouches[0].clientY
      // 将圆形icon的动画效果先隐藏
      this.$refs.circleIcon.style.webkitTransition = 'none'
    },
    touchmove (evt) {
      // 如果没有touchstart设置的值，说明没进入下拉状态，不影响正常的滚动
      if (this.pullRefresh.dragStart === null) {
        return
      }

      // 获取手指的一个target
      let target = evt.targetTouches[0]

      // 根据起始位置和屏幕高度计算一个相对位移量，正值为向上拖动，负值为向下拖动
      this.pullRefresh.percentage = (this.pullRefresh.dragStart - target.clientY) / window.screen.height

      // 获取scrollTop，为了判断是否在页面顶部
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      // 当页面处于顶部时，才能进入下拉刷新的逻辑
      if (scrollTop === 0) {
        // 当向下拖动时，才能进入下拉刷新的逻辑
        if (this.pullRefresh.percentage < 0 && evt.cancelable) {
          evt.preventDefault()

          // 将进入下拉刷新刷新标志位true
          this.pullRefresh.joinRefreshFlag = true

          // 根据moveCount速率系数计算位移的量
          let translateY = -this.pullRefresh.percentage * this.pullRefresh.moveCount

          // 当位移到一定程度，还没达到临界值时，不断去位移和旋转圆形icon
          if (Math.abs(this.pullRefresh.percentage) <= this.pullRefresh.dragThreshold) {
            // 计算圆形icon旋转的角度
            let rotate = translateY / 30 * 360

            // 位移和旋转圆形icon，利用translate3d和rotate属性
            this.$refs.circleIcon.style.webkitTransform = 'translate3d(0,' + translateY + 'px,0) rotate(' + rotate + 'deg)'
          }
        } else {
          // 向上拖动就没有进入下拉，要清除下拉刷新刷新标志位true
          if (this.pullRefresh.joinRefreshFlag == null) {
            this.pullRefresh.joinRefreshFlag = false
          }
        }
      } else {
        // 清除下拉刷新刷新标志位true
        if (this.pullRefresh.joinRefreshFlag == null) {
          this.pullRefresh.joinRefreshFlag = false
        }
      }
    },
    touchend (evt) {
      // 如果没有touchstart设置的值，说明没进入下拉状态，不影响正常的滚动
      if (this.pullRefresh.percentage === 0) {
        return
      }
      // 在手指离开时，位移量达到临界值时，并且也有进入下拉刷新的标志位，就表明要触发正在刷新
      if (Math.abs(this.pullRefresh.percentage) > this.pullRefresh.dragThreshold && this.pullRefresh.joinRefreshFlag) {
        // 通知父元素触发正在刷新
        this.$emit('onRefresh')

        // 给circleIconInner一个正在旋转的动画，利用css的animation实现
        this.$refs.circleIconInner.classList.add('circle-rotate')

        // 700ms之后，动画结束，立刻收起
        setTimeout(() => {
          this.$refs.circleIconInner.classList.remove('circle-rotate')
          this.$refs.circleIcon.style.webkitTransition = '330ms'
          this.$refs.circleIcon.style.webkitTransform = 'translate3d(0,0,0) rotate(0deg)'
        }, 700)
      } else {
        // 在手指离开时，位移量没有达到临界值，就自动收回，通过transition，设定一个终止值即可。
        if (this.pullRefresh.joinRefreshFlag) {
          this.$refs.circleIcon.style.webkitTransition = '330ms'
          this.$refs.circleIcon.style.webkitTransform = 'translate3d(0,0,0) rotate(0deg)'
        }
      }

      // 重置joinRefreshFlag
      this.pullRefresh.joinRefreshFlag = null

      // 重置percentage
      this.pullRefresh.dragStart = null

      // 重置percentage
      this.pullRefresh.percentage = 0
    }
  }
}
</script>

<style scoped>
.circle-icon {

  position: absolute;
  left: 10px;
  top: -30px;
}
.circle-icon-inner {
  width: 25px;
  height: 25px;
  background-image: url('./img/circle.png');
  background-size:cover;
}
.circle-rotate {
  animation:xuzhuan .8s linear infinite;
}
@keyframes xuzhuan{

    0%{transform:rotate(0deg);}

    25%{transform:rotate(90deg);}

    50%{transform:rotate(180deg);}

    75%{transform:rotate(270deg);}

    100%{transform:rotate(360deg);}
}

</style>
