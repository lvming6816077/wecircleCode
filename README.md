# wecircleCode
专栏[《从0到1 实战朋友圈移动Web App开发》](https://www.imooc.com/read/42)项目源码，感兴趣的可以订阅哈，感谢支持！


## 项目技术栈

前端采用Vue全家桶技术（Vue.js，vue-router，vuex，webpack，ES6）。

后端采用Node.js，Express，mongoose，MongoDB。


## 启动项目

1. 首先需要根据专栏的介绍，安装MongoDB，并启动。


2. app是前端项目源码:

    安装依赖：

    ```bash

    npm install
    ```

    本地dev启动：

    ```bash
    npm run serve
    ```

    本地打包build：

    ```bash
    npm run build
    ```


3. wecircleServer是后端项目源码:

    安装依赖：

    ```bash

    npm install
    ```

    本地启动：

    ```bash

    npm run start
    ```


## 注意事项

项目中使用的阿里云的短信服务和图片服务都需要事先申请到`accessKeySecret`，这个对于接入用户来说收费获取并且是保密的，所以如果各位想要体验，可以自行去阿里云官网注册申请。[入口](https://dysms.console.aliyun.com/dysms.htm?spm=a2c4g.11186623.2.26.2e202e79lpW6kK&accounttraceid=7d619ee3-a9ad-4890-af2e-e3ef2533b73f#/overview)


#### 各位同学也欢迎提PR，共同维护好此项目，祝大家学习愉快！
