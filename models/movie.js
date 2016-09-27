/**
 * Created by xiayibin on 16/5/13.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

//定义一种Schema
var MovieSchema = new Schema({
    movieId: {type: String, unique: true,require: true, default: ''},   //id
    year: {type: Number, require: true, default: 2016}, //年份
    doctor: {type: String, require: true, default: ''},   //导演
    country : {type: String, require: true, default: ''},   //国家
    title: {type: String, require: true, default: ''},            //电影名字
    language: {type: String, require: true, default: 'zh'},     //zh..不同的语言
    summary: {type: String, require: true,default: ''},  //简介
    poster: {type: String, require: true, default: ''},   //海报
    flash: {type: String, require: true, default: ''},      //视频
    delete: {type:Boolean,require: true, default: false},         //是否被删除
    count: {type: Number, require: true, default: 0},
    createTime: {type: Number, require: true, default: Date.now},
    updateTime: {type: Number, require: true, default: Date.now}
});

MovieSchema.pre('save', function (next) {
    this.updateTime = Date.now();
    next();
});




//将该Schema发布为Model
mongoose.model('Movie', MovieSchema);