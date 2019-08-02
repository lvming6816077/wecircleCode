/* eslint no-var:0 */
/* eslint no-magic-numbers:0 */
/* eslint eqeqeq:0 */
/* eslint no-param-reassign:0 */
var daysInMonth = function (year, month) {
  if (month === 2) {
    if (year % 4 === 0 && year % 100 !== 0) {
      return 29
    } else {
      return 28
    }
  } else if ((month <= 7 && month % 2 === 1) || (month > 7 && month % 2 === 0)) {
    return 31
  } else {
    return 30
  }
}

var addYear = function (date, year) {
  return new Date(date.getFullYear() + year, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
}

var addMonth = function (date) {
  var m = date.getMonth()
  var daysInNextMonth
  var day

  if (m === 11) {
    return new Date(date.getFullYear() + 1, 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
  }

  daysInNextMonth = daysInMonth(date.getFullYear(), date.getMonth() + 1)
  day = date.getDate()

  if (day > daysInNextMonth) {
    day = daysInNextMonth
  }

  return new Date(date.getFullYear(), date.getMonth() + 1, day, date.getHours(), date.getMinutes(), date.getSeconds())
}

var isInSpecificYesterday = function (time, specTime) {
  specTime.setDate(specTime.getDate() - 1)
  return time.toDateString() == specTime.toDateString()
}

/*
describe: 发表时间，显示策略为
判断是否是今天，如果是
    1分钟内，显示“刚刚”
    1分钟至1小时，显示“x分钟前”
    1小时至24小时，显示“x小时前”
超出24小时，但是是昨天
    显示“昨天”
超出昨天至1个月，显示“x天前”
超出1个月至1年，显示“x月x日”
超出1年，显示“x年x月x日”
*/

var formatTime = function (publishTimestamp, curTimestamp) {
  publishTimestamp = Number(publishTimestamp)
  if (!publishTimestamp || publishTimestamp < 0) {
    return ''
  }

  curTimestamp = curTimestamp || (new Date() / 1000)

  var interval = curTimestamp - publishTimestamp
  var publishTime = new Date(publishTimestamp * 1000)
  var curTime = new Date(curTimestamp * 1000)
  var month

  if (interval <= 59) {
    return '刚刚'
  } else if (interval < 61) {
    return '1分钟前'
  } else if (interval < 60 * 60) {
    return Math.floor(interval / 60) + '分钟前'
  } else if (interval < 60 * 60 * 24) {
    return Math.floor(interval / (60 * 60)) + '小时前'
  } else if (isInSpecificYesterday(publishTime, curTime)) {
    return '昨天'
  } else if (addMonth(publishTime) > curTime) {
    return Math.ceil(interval / (60 * 60 * 24)) + '天前'
  } else if (addYear(publishTime, 1) > curTime) {
    month = publishTime.getMonth() + 1
    return month + '月' + publishTime.getDate() + '日'
  } else {
    month = publishTime.getMonth() + 1
    return publishTime.getFullYear() + '年' + month + '月' + publishTime.getDate() + '日'
  }
}

export default formatTime
