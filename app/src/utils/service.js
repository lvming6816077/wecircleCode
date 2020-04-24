import axios from 'axios'

import { createRouter } from '../router'
import { getCookie } from './cookie'

const baseURL = process.env.NODE_ENV === 'production' ? 'http://localhost:3000/' : 'http://localhost:3000/'

// 创建axios实例
let service = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 30000 // 请求超时时间
})

// 添加request拦截器
service.interceptors.request.use(config => {
  return config
}, error => {
  Promise.reject(error)
})
// 添加respone拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code === 1000) {
      const router = new createRouter()
      router.push({
        path: 'login',
        name: 'login',
        params: {
        }
      })
      weui.topTips('请先登录')
      // 发现登录过期，将本地缓存的用户信息清除
      window.localStorage.removeItem('cuser')
    } else if (response.data.code !== 0) {
      weui.topTips(response.data.msg || '接口请求失败')
    }

    return response.data
  },
  error => {
    return Promise.reject(error.response)
  }
)

function get (url, params = {}) {
  return service({
    url: url,
    method: 'get',
    headers: {
      'wec-access-token': getCookie('token')
    },
    params
  })
}
function getNoHeader (url, params = {}) {

  return service({
    url: url,
    method: 'get',

    params
  })
}

// 封装post请求
function post (url, data = {}) {
  // 默认配置
  let sendObject = {
    url: url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'wec-access-token': getCookie('token')
    },
    data: data
  }
  return service(sendObject)
}

// 封装put方法 (resfulAPI常用)
function put (url, data = {}) {
  return service({
    url: url,
    method: 'put',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: JSON.stringify(data)
  })
}

// 不要忘记export
export default {
  get,
  post,
  put,
  getNoHeader,
  baseURL,
  token: getCookie('token')
}
