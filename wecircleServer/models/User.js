var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  nickname: { type: String, maxlength: 20 },
  avatar: String,
  bgurl:String,
  phoneNum: String,
  desc: { type: String, maxlength: 20 ,default:''},
  gender:String,
  params: { type: Schema.Types.Mixed, default:{'vip':0} },// 用户额外信息
  update: { type: Date, default: Date.now },
  create: { type: Date, default: Date.now },
},{timestamps:{createdAt: 'create',updatedAt:'update'}});

module.exports = mongoose.model('User', UserSchema);