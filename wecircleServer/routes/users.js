var express = require('express');
var router = express.Router();
var sms = require('../utils/sms');
var User = require('../models/User');
var Subscription = require('../models/Subscription');

var token = require('../utils/token');
var push = require('../utils/push');

var config = require('../config');

var svgCaptcha = require('svg-captcha');

var rateLimit = require("express-rate-limit");

/*
* 创建一个用户
*/
var createUser = function(data){

  var nickname = '用户'+Date.now();
  var avatar = config.uploadPath+'avatar/avatar'+Math.ceil(Math.random() * 9 )+'.jpg';
  var bg = config.uploadPath+'bg/topbg'+Math.ceil(Math.random() * 4 )+'.jpg';
  var gender = '1';
  return User.create({
    nickname: nickname,
    avatar: avatar,
    gender: gender,
    bgurl:bg,
    phoneNum:data.phonenum
  });
}

/*
* 根据手机号判断是新用户还是老用户
*/
var checkUser = function(data){
  return User.findOne({phoneNum:data.phonenum}).exec();

}

/*
* 验证码请求限制调用频率同一个ip 1分钟调用最多1次
*/

var phonecodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 分钟调用1次
  max: 1, // 1分钟调用1次
  handler:function(req, res, next){
    res.json({
      code: 1,
      msg: '请稍后请求'
    });
  }
});



router.get('/phonecode', phonecodeLimiter, (req, res, next)=> {
  

  // 对referer做一下校验

  if (req.headers.referer) {
    if (req.headers.referer.indexOf('https://app.nihaoshijie.com.cn') > -1 || req.headers.referer.indexOf('http://localhost') > -1){

    } else {
      res.json({
        code:1,
        msg:'非法请求'
      });
      return
    }

  } else {
    res.json({
      code:1,
      msg:'非法请求'
    });
    return
  }
  
  console.log(req.headers)

  //调用阿里云短信接口
  sms.sendSms({
    //从body里获取电话号码
    phonenum: req.query.phonenum,
  },function(result){
    //返回成功
    res.json({
      code:0,
      data:result
    });
  },function(result){
    //返回失败
    res.json({
      code:1,
      data:result
    });
  });
  
});
/*
* 根据id获取个人信息
*/
router.get('/userinfo', async (req, res, next)=> {
  
  try {
    var user = await User.findById(req.query.userId).exec();

    res.json({
      code:0,
      data:user
    });
  }catch(e){
    console.log(e)
    res.json({
      code:1,
      data:e
    });
  }

});
/*
* 更新个人信息
*/
router.post('/update', async (req, res, next)=> {
  try {

    var user = await User.findByIdAndUpdate(req.user._id, req.body).exec();

    res.json({
      code:0,
      data:user
    });
  }catch(e){
    res.json({
      code:1,
      data:e
    });
  }

  
});

/*
* 获取验证码图片
*/
router.get('/captcha',  (req, res)=> {
  var captcha = svgCaptcha.create({
    ignoreChars:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',// 排除字母，只用数字
    noise: 2 // 干扰线条的数量
  });
  // console.log(captcha)
  res.cookie('captcha', captcha.text, {
      maxAge: 60*1000*30,// 设置到cookie里 时效30分钟
      httpOnly:true
  });
  
  //返回验证码图片
  res.type('svg');
  res.status(200).send(captcha.data);
});

/*
* 登录请求限制调用频率同一个ip 1分钟调用最多10次
*/
var signupLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 分钟调用10次
  max: 10, // 1分钟调用10次
  skip: function (req, res) {
    // console.log('skip')
    // console.log(req)
     return req.cookies.captcha ? true : false;
  },
  handler:function(req, res, next){
    res.json({
      code: 0,
      data: {
        code: 'needCaptcha'
      }
    });
  }
});

/*
* 注册/登录
*/
router.post('/signup', signupLimiter, async (req, res, next)=> {

  // if (1) {
  //   var user = await checkUser(req.body);
  //   if (!user) {
  //     user = await createUser(req.body);
  //   }
  //   token.setToken({user,res});
  //   res.json({
  //     code:0,
  //     data:user
  //   });
  // }
  // return;

  // 如果cookie里有验证码，证明此次登录请求是需要验证码
  if (req.cookies.captcha) {
    // 如果没有输入验证码，返回前端需要输入验证码
    if (!req.body.captcha) {
      res.json({
        code: 0,
        data: {
          code: 'needCaptcha'
        }
      });
      return 
    }
    //验证验证码是否正确
    if (req.body.captcha.toLocaleLowerCase() !== req.cookies.captcha.toLocaleLowerCase()) {
      res.json({
        code:1,
        msg:'验证码错误'
      });
      return 
    } else {

      //验证码校验正确，清除cookie，下次就不需要输入验证码登录
      res.clearCookie('captcha');
    }
  }
  console.log(req.body)

  //检查手机验证码是否合法
  sms.checkCode({
    phonenum: req.body.phonenum,
    code: req.body.code,
  },async function(result){

    if (result.code === 0) {
      //是否是已经存在的用户
      var user = await checkUser(req.body);
      //没有的话创建一个新的用户
      if (!user) {
        user = await createUser(req.body);
      }
      //将用户数据设置在cookie里面
      token.setToken({user,res});
      //返回当前用户数据
      res.json({
        code:0,
        data:user
      });
    } else {
      //验证码值不合法返回错误信息
      res.json({
        code:1,
        data:result.msg,
        msg:result.msg
      });
    }

  }, function(result){
    //验证码值不合法返回错误信息
    res.json({
      code:1,
      data:result.msg,
      msg:result.msg
    });
  });


  
});

/*
* 添加订阅信息
*/
router.post('/addsubscription', async (req, res, next)=> {
  var userid = req.user ? req.user._id : '';

  try {
    var result = await Subscription.create({
      subscription: req.body.subscription,
      userid:userid
    })

    res.json({
      code:0,
      data:result
    })
  }catch(e){
    // console.log(e)
    res.json({
      code:0,
      data: e.errmsg.indexOf('dup key') ? 'has scription' : e.errmsg
    })
  }

  
});

module.exports = router;
