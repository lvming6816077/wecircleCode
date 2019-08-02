var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  content: { type: Schema.Types.Mixed },//聊天内容
  fromUser: { type: Schema.Types.ObjectId, ref: 'User',required:true },//发送者
  chat:{ type: Schema.Types.ObjectId, ref: 'Chat',required:true },//聊天id关联
  toUser: { type: Schema.Types.ObjectId, ref: 'User',required:true },//接收者
  create: { type: Date, default: Date.now },
  update: { type: Date, default: Date.now },
},{timestamps:{createdAt: 'create',updatedAt:'update'}});

module.exports = mongoose.model('Message', MessageSchema);