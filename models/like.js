/**
 * Created by yuansc on 15/6/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikeSchema = new Schema({
  newsId: {type: String, require: true,index: true},
  userId:{type: String, require: true, index: true},
  appId: {type: String, require: true,default: '0'},  //appId,用来区分不同的应用
  article: Schema.Types.Mixed,
  createTime: {type: Number, require: true, default: Date.now},
  updateTime: {type: Number, require: true, default: Date.now}
});

LikeSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});

LikeSchema.index({newsId: 1, userId: 1}, {unique: true});


mongoose.model('Likes', LikeSchema);