var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
  params: { type: Schema.Types.Mixed },//聊天相关的参数，例如背景图片等等
  isDel:{ type: Boolean,required:true,default:false },//是否删除
  lastMsgTime: { type: Date, default: Date.now },// 最近一条消息的时间
  fromUser:{ type: Schema.Types.ObjectId, ref: 'User',required:true },//聊天的发起者
  toUser:{ type: Schema.Types.ObjectId, ref: 'User',required:true },//聊天的接收者
  create: { type: Date, default: Date.now },
  update: { type: Date, default: Date.now },
}, {timestamps:{createdAt: 'create',updatedAt:'update'}});

module.exports = mongoose.model('Chat', ChatSchema);