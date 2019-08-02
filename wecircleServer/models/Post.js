var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  content: { type: String,required:true },//朋友圈文本内容
  picList: { type: Schema.Types.Mixed },//朋友圈图片内容
  create: { type: Date, default: Date.now },//创建时间
  update: { type: Date, default: Date.now },//更新时间
  user:{ type: Schema.Types.ObjectId, ref: 'User',required:true }//朋友圈的Users外键属性，标识谁发的朋友圈
},{timestamps:{createdAt: 'create',updatedAt:'update'}});

module.exports = mongoose.model('Post', PostSchema);