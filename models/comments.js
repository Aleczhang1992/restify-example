/**
 * Created by yuansc on 15/6/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentsSchema = new Schema({
  newsId: {type: String, require: true,index: true},
  userId:{type: String, require: true, index: true},
  content: {type: String, require: true},
  createTime: {type: Number, require: true, default: Date.now},
  updateTime: {type: Number, require: true, default: Date.now},
  username: {type: String, require: true},
  avatar: {type: String, require: true}
});

CommentsSchema.pre('save', function (next) {
  this.updateTime = Date.now();
  next();
});


mongoose.model('Comments', CommentsSchema);