const u = navigator.userAgent
const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
const isIpP = window.screen.height == 736 && window.screen.width == 414
export default {
  isIOS: isIOS,
  isAndroid: isAndroid,
  isIpP: isIpP,
  getKeyBoardHeightDefault: function () {
    if (isIOS) {
      let screen = window.screen
      // iphone x
      if (screen.height == 812 && screen.width == 375) {
        return 377
      } else if (screen.height == 736 && screen.width == 414) { // iphone plus
        return 315
      } else if (screen.height == 667 && screen.width == 375) { // iphone 678
        return 304
      } else if (screen.height == 568 && screen.width == 320) { // iphone 5 se
        return 220
      } else {
        return 304
      }
    } else {
      return 304
    }
  }
}
