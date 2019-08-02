
var jwt = require('jsonwebtoken'); // 使用jwt签名
var tokenTime = 1000 * 60 * 60 * 24 * 4;// 授权时效24*4小时

module.exports = {
  /*
  * 设置token
  */

  setToken(data){
    //将当前用户的信息通过token加密，并设置失效时间，得到token加密字符串
    var token = jwt.sign({user:data.user}, 'myjwttest', {
      expiresIn : tokenTime
    });
    //将token加密的字符串通过setCookie的方式传给客户端
    data.res.cookie('token', token, {
        maxAge: tokenTime,
        // httpOnly: true
    });
  },
  /*
  * 校验token
  */
  checkToken(data){
    var user = null;
    try {
      //如果根据token查到了用户信息，表示校验通过
      var decoded = jwt.verify(data.token, 'myjwttest');
      user = decoded.user;

    }catch(e){

    }
    
    return user
  }
};
