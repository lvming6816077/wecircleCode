var express = require('express');
var multer  = require('multer');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var Post = require('../models/Post.js');
var Comment = require('../models/Comment.js');
var Like = require('../models/Like.js');
var config = require('../config');
var push = require('../utils/push');




var storageMemory = multer.memoryStorage()
// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../public/upload/'));    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        var extname = path.extname(file.originalname);//获取文件扩展名
        // 将保存文件名设置为 字段名 + 时间戳+文件扩展名，比如 logo-1478521468943.jpg
        cb(null, file.fieldname + '-' + Date.now() + extname);
    }
});

    
var upload = multer({ storage: storage});


var sizeOf = require('image-size');
/*
* 根据post查询评论数据
*/
var getCommentByPost = async function(post){
  return Comment.find({post:post._id}).populate('user').sort({'create':1}).exec();
}
/*
* 根据post查询点赞数据
*/
var getLikeByPost = async function(post){
  return Like.find({post:post._id}).populate('user').sort({'create':1}).exec();
}
/*
* 根据post是否被当前用户点赞
*/
var checkPostIsLike = function(likes,currentUserId){

  if (!currentUserId) return false;
  var flag = false;
  for (var i = 0 ; i < likes.length ; i++) {
    if (likes[i].user._id == currentUserId._id) {
      flag = true;
      break;
    }
  }
  return flag;
}
/*
* 阿里云图片上传
*/
router.post('/uploadimgaliyun',upload.single('image'), async function(req, res, next) {
  const OSS = require('ali-oss');
  const client = new OSS({
    region: 'oss-cn-beijing',//bucket所在的区域
    accessKeyId: 'LTAIEGH3Ov5cRwBW',//accessKeyId
    accessKeySecret: config.accessKeySecret,//accessKeySecret，请各位使用自己的accessKeySecret
    bucket: 'wecircle'
  });
  //从请求中得到文件数据
  var file = req.file;
  //得到图片尺寸
  var dimensions = sizeOf(file.path);
  //调用阿里云接口上传
  let result = await client.put(file.filename, file.path);
  // console.log(result);
  //返回数据
  res.json({
    code:0,
    data:{
      url: result.url.replace('http:',''),
      size: dimensions
    }
  });
  //删除临时图片文件
  fs.unlinkSync(file.path)
});


/*
* 本地图片上传
*/
router.post('/uploadimg', upload.single('image'),function(req, res, next) {
  //从请求中得到文件数据
  var file = req.file;
  //得到图片尺寸
  var dimensions = sizeOf(file.path);
  console.log('文件类型：%s', file.mimetype);
  console.log('原始文件名：%s', file.originalname);
  console.log('文件大小：%s', file.size);
  console.log('文件保存路径：%s', file.path);

  res.json({
    code:0,
    data:{
      url: config.uploadPath+file.filename,//本地的图片url地址
      size: dimensions
    }
  });
});

/*
* 获取朋友圈列表数据
*/
router.get('/getcirclepost', async function(req, res, next) {

  //分页pageSize
  var pageSize = 5;
  //分页pageSizepageStart
  var pageStart = req.query.pageStart || 0;

  //先查出post
  var posts = await Post.find().skip(pageStart*pageSize).limit(pageSize).populate('user').sort({'create':-1}).exec();
  
  var result = [];

  for (var i = 0 ; i < posts.length ; i++) {
    //根据post查comments
    var comments = await getCommentByPost(posts[i]);
    //根据post查likes
    var likes = await getLikeByPost(posts[i]);
    
    //这里对数据做一次拷贝，否则无法直接给数据添加字段
    var post = JSON.parse(JSON.stringify(posts[i]));
    //将数据组装到post列表里
    post.comments = comments || [];
    post.likes = likes || [];
    //判断是否点过赞
    post.isLike = checkPostIsLike(likes, req.user);

    result.push(post);
  }


  res.json({
    code:0,
    data:result
  });

});
/*
* 创建朋友圈post
*/
router.post('/savepost', async function(req, res, next) {

  //获取到当前用户的id
  var userid = req.user._id;
  //从req.body里获取content和picList
  /*{
    "content": "hello",
    "picList": [{
      "url": "//wecircle.oss-cn-beijing.aliyuncs.com/image-1559201643093.png",
      "size": {
        "width": 933,
        "height": 563,
        "type": "png"
      },
      "id": 1
    }]
  }*/
  var p = {
    content: req.body.content,
    picList: req.body.picList,
    user:userid//user和post关联
  };

  try {
    //调用PostModel的静态方法create
    //await方式返回保存后的Post对象，如果发生错误将会进入catch方法
    var result = await Post.create(p);
    res.json({
      code:0,
      data:result
    });
  }catch(e){
    res.json({
      code:1,
      data:e
    });
  }
  

});

module.exports = router;
