
(function (root) {
  // 构造函数
  function Slider (opts) {
    // 构造函数需要的参数
    var imgWrap = document.createElement('DIV')
    imgWrap.style.cssText = '-webkit-transform:translate3d(0,0,3px);-webkit-transition:opacity 200ms;opacity:0;position:fixed;top:0;left:0;right:0;bottom:0;background-color: #000;z-index:999;'
    this.wrap = imgWrap
    this.list = opts.list
    // 初始在哪一页
    this.idx = opts.page || 0
    // 初始化方法
    this.init()
    // 渲染dom
    this.renderDOM()
    // 绑定事件
    this.bindDOM()
  }

  // 第一步 -- 初始化
  Slider.prototype.init = function () {
    // 设定窗口比率
    this.radio = window.innerHeight / window.innerWidth
    // 设定一页的宽度 +10 代表每张图片流一定的间距
    this.scaleW = window.innerWidth + 10

    this.scaleMax = 2;
  }

  // 第二步 -- 根据数据渲染DOM
  Slider.prototype.renderDOM = function () {
    var wrap = this.wrap
    //图片的数据
    var data = this.list
    var len = data.length

    this.outer = document.createElement('ul')
    this.outer.style.cssText = 'height:100%;overflow:hidden;'
    // 根据元素的
    for (var i = 0; i < len; i++) {
      var li = document.createElement('li')
      li.style.cssText = 'position:absolute;display:flex;align-items:center;overflow:hidden;height:100%;'
      var item = data[i]
      li.style.width = window.innerWidth + 'px'
      li.style.webkitTransform = 'translate3d(' + (i - this.idx) * this.scaleW + 'px, 0, 0)'
      if (item) {
        // 根据窗口的比例与图片的比例来确定
        // 图片是根据宽度来等比缩放还是根据高度来等比缩放
        if (item['height'] / item['width'] > this.radio) {
          li.innerHTML = '<img style="max-width:100%;max-height:100%;height:'+window.innerHeight+'px;margin: 0 auto;"  src="' + item['img'] + '">'
        } else {
          li.innerHTML = '<img style="max-width:100%;max-height:100%;width:'+window.innerWidth+'px;margin: 0 auto;"  src="' + item['img'] + '">'
        }
      }
      this.outer.appendChild(li)
    }

    // UL的宽度和画布宽度一致
    this.outer.style.cssText = 'width:' + this.scaleW + 'px;height:100%;overflow:hidden;'

    wrap.style.height = window.innerHeight + 'px'
    wrap.appendChild(this.outer)

    this.divider = document.createElement('ul')
    this.divider.style.cssText = 'position: absolute;bottom: 24px;left: 50%;font-size:19px;-webkit-transform: translateX(-50%);color: rgb(109, 109, 109);'

    //渲染分页的UI和样式
    for (var k = 0; k < len; k++) {
      var dividerItem = document.createElement('li')
      dividerItem.innerText = '•'
      dividerItem.style.cssText = 'float:left;margin-right:5px;'
      if (k === this.idx) {
        dividerItem.style.color = '#fff'
      }

      this.divider.appendChild(dividerItem)
    }

    //当传入的图片列表大于等于2，才显示分页组件
    if (len >= 2) {
      wrap.appendChild(this.divider)
    }
  }

  Slider.prototype.goIndex = function (n) {
    var idx = this.idx
    var lis = this.outer.getElementsByTagName('li')
    var len = lis.length
    var cidx

    cidx = idx + n * 1

    // 当索引右超出
    if (cidx > len - 1) {
      cidx = len - 1
      // 当索引左超出
    } else if (cidx < 0) {
      cidx = 0
    }

    // 保留当前索引值
    this.idx = cidx

    // 改变过渡的方式，从无动画变为有动画
    lis[cidx].style.webkitTransition = '-webkit-transform 0.2s ease-out'
    lis[cidx - 1] && (lis[cidx - 1].style.webkitTransition = '-webkit-transform 0.2s ease-out')
    lis[cidx + 1] && (lis[cidx + 1].style.webkitTransition = '-webkit-transform 0.2s ease-out')

    // 改变动画后所应该的位移值
    lis[cidx].style.webkitTransform = 'translate3d(0, 0, 0)'
    lis[cidx - 1] && (lis[cidx - 1].style.webkitTransform = 'translate3d(-' + this.scaleW + 'px, 0, 0)')
    lis[cidx + 1] && (lis[cidx + 1].style.webkitTransform = 'translate3d(' + this.scaleW + 'px, 0, 0)')

    for (var i = 0; i < this.divider.children.length; i++) {
      var current = this.divider.children[i].style

      if (i === cidx) {
        current.color = '#fff'
      } else {
        current.color = 'rgb(109, 109, 109)'
      }
    }
  }

  // 第三步 -- 绑定 DOM 事件
  Slider.prototype.bindDOM = function () {
    var self = this
    var scaleW = self.scaleW
    var outer = self.outer


    // 手指按下的处理事件
    var startHandler = function (evt) {
      // 记录刚刚开始按下的时间
      self.startTime = new Date() * 1

      // 记录手指按下的坐标
      self.startX = evt.touches[0].pageX
      self.startY = evt.touches[0].pageY

      // 清除偏移量
      self.offsetX = 0

      if(evt.touches.length >= 2){  //判断是否有两个点在屏幕上
        self.joinPinchScale = true; //进入双指方法状态
        self.pinchStart = evt.touches;  //得到第一组两个点
        self.pinchScaleEnd = self.pinchScale || (self.joinDbClickScale ? self.scaleMax : 1);  //记录最后一次缩放的值
      }

      if (evt.touches.length === 1) {
        self.oneTouch = true;
      }
    }


    // 手指移动的处理事件
    var moveHandler = function (evt) {
      // 兼容chrome android，阻止浏览器默认行为
      evt.preventDefault()
      var target = evt.target;
      // 处理放大逻辑
      if (target.nodeName === 'IMG') {
        // console.log(evt.touches)
        // 处理双指放大
        if (self.joinPinchScale && evt.touches.length >= 2) {
          var now = evt.touches;  //得到第二组两个点

          self.pinchScale = self.pinchScaleEnd*(getDistance(now[0],now[1])/getDistance(self.pinchStart[0],self.pinchStart[1])); //得到缩放比例，getDistance是勾股定理的一个方法
          
          target.style.webkitTransition = 'none';
          // var originY = Math.abs(self.pinchStart[0].clientY - self.pinchStart[1].clientY)/2
          // var originX = Math.abs(self.pinchStart[0].clientX - self.pinchStart[1].clientX)/2
          // target.style.webkitTransformOriginX = originX + 'px'
          // target.style.webkitTransformOriginY = originY + 'px'
          target.style.webkitTransform = 'scale3d('+self.pinchScale+', '+self.pinchScale+', 1)';

          return

        }


        //处理双击,双指放大状态时的拖动行为
        else if ((self.joinPinchScale || self.joinDbClickScale) && self.oneTouch) {
          // 计算手指的偏移量
          self._offsetX = (self._offsetEndX||0) + evt.targetTouches[0].pageX - self.startX;
          self._offsetY = (self._offsetEndY||0) + evt.targetTouches[0].pageY - self.startY;
          var _scale = self.joinPinchScale ? self.pinchScale : self.scaleMax; // 拖动时，保持图片缩放不变，只位移
          target.style.webkitTransition = 'none';
          target.style.webkitTransform = 'scale3d('+_scale+', '+_scale+', 1) translate3d('+(self._offsetX*0.5)+'px, '+(self._offsetY*0.5)+'px, 0)';
          return
        }

      }

      if (self.oneTouch) {
        // 处理翻页逻辑
        // 计算手指的偏移量
        self.offsetX = evt.targetTouches[0].pageX - self.startX

        var lis = outer.getElementsByTagName('li')
        // 起始索引
        var i = self.idx - 1
        // 结束索引
        var m = i + 3

        // 最小化改变DOM属性
        for (i; i < m; i++) {
          lis[i] && (lis[i].style.webkitTransition = '-webkit-transform 0s ease-out')
          lis[i] && (lis[i].style.webkitTransform = 'translate3d(' + ((i - self.idx) * self.scaleW + self.offsetX) + 'px, 0, 0)')
        }
      }




    }

    // 手指抬起的处理事件
    var endHandler = function (evt) {
      var target = evt.target;

      //处理放大状态的拖动行为记录最后1次手指离开的坐标
      if (target.nodeName === 'IMG' && (self.joinDbClickScale || self.joinPinchScale)) {
        self._offsetEndX = self._offsetX;
        self._offsetEndY = self._offsetY;
        // weui.topTips('登录请使用指定浏览器，体验前沿的技术')
        // self.joinPinchScale = false
        // self.joinDbClickScale = false

        if (self.pinchScale < 1) {
          target.style.webkitTransition = '-webkit-transform .2s ease-in-out'
          target.style.webkitTransform = 'scale3d(1,1,1)'
          self.pinchScale = 1;
        }
      }

      self.oneTouch = false;



      // return

      // 边界就翻页值
      var boundary = scaleW / 6

      // 手指抬起的时间值
      var endTime = new Date() * 1

      // 当手指移动时间超过300ms 的时候，按位移算
      if (endTime - self.startTime > 300) {
        if (self.offsetX >= boundary) {
          self.goIndex('-1')
        } else if (self.offsetX < 0 && self.offsetX < -boundary) {
          self.goIndex('+1')
        } else {
          self.goIndex('0')
        }
      } else {
        // 优化
        // 快速移动也能使得翻页
        if (self.offsetX > 50) {
          self.goIndex('-1')
        } else if (self.offsetX < -50) {
          self.goIndex('+1')
        } else {
          self.goIndex('0')
        }
      }
    }

    // 双击放大事件
    var dbHandler = function (evt) {

      var target = evt.target
      var d = evt
      if (target.nodeName === 'IMG') {
        if (self.joinDbClickScale || self.joinPinchScale) {
          target.style.webkitTransition = '-webkit-transform .2s ease-in-out'
          target.style.webkitTransform = 'scale3d(1,1,1)'

          self.joinDbClickScale = false
          self.joinPinchScale = false

          self.pinchScale = 1;
        } else {
          self.originX = d.offsetX;
          self.originY = d.offsetY;
          target.style.webkitTransition = '-webkit-transform .2s ease-in-out'
          target.style.webkitTransform = 'scale3d('+self.scaleMax+','+self.scaleMax+',1)'
          target.style.webkitTransformOriginX = self.originX + 'px'
          target.style.webkitTransformOriginY = self.originY + 'px'

          // self.pinchScaleEnd = 1;
          self.pinchScale = self.scaleMax;
          self.joinDbClickScale = true
        }
      }


    }

    var tapCloseHandler = function (evt) {
      self.wrap.style.opacity = 0
      setTimeout(function () {
        document.body.removeChild(self.wrap)
      }, 200)
    }
    var lastClickTime = 0
    var clickTimer
    var clkHandler = function (evt) {
      var nowTime = new Date().getTime()
      if (nowTime - lastClickTime < 230) {
        /* 双击 */
        lastClickTime = 0
        clickTimer && clearTimeout(clickTimer)
        dbHandler(evt)
      } else {
        /* 单击 */
        lastClickTime = nowTime
        clickTimer = setTimeout(function () {
          tapCloseHandler(evt)
        }, 230)
      }
    }

    
    var getDistance = function (p1, p2) {
        var x = p2.pageX - p1.pageX,
            y = p2.pageY - p1.pageY;
        return Math.sqrt((x * x) + (y * y)).toFixed(2);
    };


    document.body.appendChild(this.wrap)
    setTimeout(function () {
      self.wrap.style.opacity = 1
    })


    outer.addEventListener('touchstart', startHandler)
    outer.addEventListener('touchmove', moveHandler)
    outer.addEventListener('touchend', endHandler)
    outer.addEventListener('click', clkHandler)

        
  }

  root.Slider = Slider
})(window)

window.onload = function() {
    // // 阻止双击放大
    // var lastTouchEnd = 0;
    // document.addEventListener('touchstart', function(event) {
    //     if (event.touches.length > 1) {
    //         event.preventDefault();
    //     }
    // });
    // document.addEventListener('touchend', function(event) {
    //     var now = (new Date()).getTime();
    //     if (now - lastTouchEnd <= 300) {
    //         event.preventDefault();
    //     }
    //     lastTouchEnd = now;
    // }, false);

    // 阻止双指放大
    document.addEventListener('gesturestart', function(event) {
        event.preventDefault();
    });
}

