/**
 * Created by yuansc on 15/6/23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VersionSchema = new Schema({
  type:{type: String, require: true,index:true},
  appId:{type: String, require: true,index:true},
  version:{type: String, require: true},
  updateType:{type: String, require: true}, //0-不需要更新，1-非强制更新，2-强制更新
  updateInfo:Schema.Types.Mixed,
  downloadUrl:{type: String, require: true},
  createTime: {type: Number, require: true, default: Date.now}
});

//VersionSchema.pre('save', function (next) {
//  this.updateTime = Date.now();
//  next();
//});


mongoose.model('Version', VersionSchema);