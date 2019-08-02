var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Message = require('../models/Message');
var Chat = require('../models/Chat');
var push = require('../utils/push')
var socket = require('../utils/socket')



var getMsgByChat = async function(chat,keyword){
  var reg = new RegExp(keyword, 'i')

  var list = await Message.find({
    chat:chat._id,
    'content.type':'str',
    'content.value': {
      $regex: reg
    }
  }).sort({'create':-1}).exec();

  return list[0] || false
}

var addmsg = async function(myId,content,toUserId){

  var chatId = '';

  //首先需要查询是否已经有过聊天
  var list = await Chat.find({
    $or:[
      { $and: [{fromUser: myId}, {toUser: toUserId}]},
      { $and: [{fromUser: toUserId}, {toUser: myId}]}
      ]
    }).sort({'create':1}).exec();

  //如果有就把chatId记录下来
  if (list.length) {
    chatId = list[0]._id;
  }
  //如果没有就创建一个
  else {
    var chat = await Chat.create({
      params: {
        users:[myId,toUserId]
      },
      fromUser: myId,
      toUser: toUserId,

    });

    chatId = chat._id;

  }

  //添加一条消息
  var result = await Message.create({
    content: content,
    fromUser: myId,//发送者的id，也就是当前登录用户的id
    chat:chatId,//将之前的chatId外键存入的message里
    toUser: toUserId,//接收者的ID

  });

  // 更新chat的最新一条消息时间
  var updateChat = await Chat.findByIdAndUpdate(chatId, {
    lastMsgTime: result.create
  }).exec();



  return result;


}
/*
* 发送消息接口
*/
router.post('/addmsg', async (req, res, next)=> {
  //当前登录用户的id
  var myId = req.user._id;
  //发送的内容
  var content = req.body.content;
  //接收着的id
  var toUserId = req.body.toUser;

  try {
    var result = await addmsg(myId, content, toUserId);

    //消息创建成功
    if (result._id) {

      //消息通知逻辑
      if (result.content.type === 'str') {
        push(result.toUser,{title:'收到新消息',body:result.content.value});
      } else {
        push(result.toUser,{title:'收到新消息',body:'[图片]'});
      }


      //把用户详细查询出来
      var user = await User.findById(result.fromUser).exec();
      
      //socket实时消息
      socket.sendMsg({
        id:toUserId,
        action: 'recieveMsg',
        data: {
          content: result.content,
          fromUser: user
        },
        
      });

    }


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
/*
* 查询私信列表接口
*/
router.get('/getchatlist', async (req, res, next)=> {
  

  try {
    var myId = req.user._id;
    //搜索使用的关键字字段
    var keyword = req.query.keyword || '';
    //查询接收者和发送者是当前登录用户的数据
    var list = await Chat.find({
    $or:[
      { fromUser: myId},
      { toUser: myId}
      ]
    }).populate('fromUser').populate('toUser').sort({'lastMsgTime':-1}).exec()

    var result = [];

    //找到chat数据后，查询相关的message数据
    for (var i = 0 ; i < list.length ; i++) {
      
      //todo why parse
      var chat = JSON.parse(JSON.stringify(list[i]));

      //根据chat的id，找到对应的消息列表里的第一条消息内容
      chat.msg = await getMsgByChat(list[i],keyword);

      //找到消息就push
      if (chat.msg) {
        var user = {};
        if (chat.toUser._id == myId) {
          user = chat.fromUser;
        } else {
          user = chat.toUser;
        }
        chat.user = user;
        result.push(chat);
      }

    }
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
/*
* 查询聊天记录接口
*/
router.get('/getchathistory', async (req, res, next)=> {
  

  try {
    var myId = req.user._id;
    // 根据发送者和接收着查询聊天记录
    var list = await Message.find({
      $or:[
        { $and: [{fromUser: myId}, {toUser: req.query.toUser}]},
        { $and: [{fromUser: req.query.toUser}, {toUser: myId}]}
        ]
      }).populate('fromUser').sort({'create':1}).exec()

    // 也可根据chatid查询
    // var list = await Message.find({
    //   chat: chatId
    //   }).populate('fromUser').sort({'create':1}).exec()

    var result = [];
    for (var i = 0 ; i < list.length ; i++) {
      var msg = JSON.parse(JSON.stringify(list[i]));
      //如果发送者id和当前登录用户id相等，表示出主人态
      if (req.user._id == msg.fromUser._id) {
        msg.mine = true;
      } else {
        msg.mine = false;
      }
      result.push(msg);
    }

    res.json({
      code:0,
      data:result
    });
  }catch(e){
    console.log(e)
    res.json({
      code:1,
      data:e
    });
  }

});



module.exports = {
  router:router,
  addmsg:addmsg
};
