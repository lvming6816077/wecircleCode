var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubscriptionSchema = new mongoose.Schema({
  subscription: { type: String,required:true },
  userid:{ type: String, unique: true },//注意这里不用ref外键
  update: { type: Date, default: Date.now },
  create: { type: Date, default: Date.now },
},{timestamps:{createdAt: 'create',updatedAt:'update'}});

module.exports = mongoose.model('Subscription', SubscriptionSchema);