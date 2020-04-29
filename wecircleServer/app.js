// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var tokenUtil = require('./utils/token');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');
var likecommentRouter = require('./routes/likecomment');
var messageRouter = require('./routes/message');



var mongoose = require('mongoose');

// 开启数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/wecircle',{ useNewUrlParser: true ,useCreateIndex: true,useFindAndModify:false})
  .then(function(){
    console.log('数据库wecircle连接成功');
  })
  .catch(function(error){
    console.log('数据库wecircle连接失败：' + error);
  });


var app = express();


// 跨域配置 本地调试使用
app.use(function(req, res, next) {
  // console.log(req.headers);
  res.header("Access-Control-Allow-Origin", 'http://localhost:8080');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, wec-access-token, Set-Cookie");
  res.header("Access-Control-Allow-Credentials", "true");

  next();
});
//app.use是Express拦截器的方法
app.use(function(req, res, next) {

  // 拿取token 数据 按照自己传递方式写
  var token = req.headers['wec-access-token']||'xx';
  // 检查token是否有效（过期和非法）
  var user = tokenUtil.checkToken({token});
  if (user) {
      //将当前用户的信息挂在req对象上，方便后面的路由方法使用
      req.user = user;
      
      // 续期
      tokenUtil.setToken({user,res});

      next(); //继续下一步路由
  } else {
      //需要登录态域名白名单
      if (config.tokenApi.join(',').indexOf(req.path) < 0) {
          next();
          return;
      }
      res.json({ code: 1000, message: '无效的token.' });
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/cgi/users', usersRouter);
app.use('/cgi/post', postRouter);
app.use('/cgi/likecomment', likecommentRouter);
app.use('/cgi/message', messageRouter.router);

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });



module.exports = app;
