
const os = require('os');

function getIPAdress() {
    return '39.97.100.52';
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

module.exports = {
  //需要登录态的接口
  tokenApi:[
  '/cgi/post/uploadimg',
  '/cgi/post/uploadimgaliyun',
  '/cgi/post/savepost',
  '/cgi/likecomment/addlike',
  '/cgi/likecomment/addcomment',
  '/cgi/user/update',
  '/cgi/likecomment/removelike',
  '/cgi/message/addmsg',
  '/cgi/message/getchatlist',
  '/cgi/message/getchathistory'
  ],
  uploadPath:'//app.nihaoshijie.com.cn/upload/',
  accessKeySecret: 'abc123'
};
