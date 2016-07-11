/**
 * Created by xiayibin on 16/5/13.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

var RecommendationSchema = new Schema({
    menuId: {type: String, require: true, default: ''},   //栏目id
    level: {type: Number, require: true, default: 999}, //排序等级,越小越靠前
    type: {type: Number, require: true, default: 0},   //栏目类型。0=普通栏目，展示列表；1=电台;2=特殊栏目，展示webview
    url: {type: String, require: true, default: ''},   //特殊栏目的url。type=1时需要
    title: {type: String, require: true, default: ''},            //栏目的名字
    Attributes: {type: String, require: true, default: 'zh'},     //zh..不同的语言
    appId: {type: String, require: true,default: '0'},  //appId,用来区分不同的应用
    isSubscribed: {type: String, require: true, default: 'NO'},   //YES=已订阅；NO=未订阅
    isDelete: {type: String, require: true, default: 'YES'},      //YES=可删除；NO=不可删除
    delete: {type:Boolean,require: true, default: false},         //栏目是否被删除
    count: {type: Number, require: true, default: 0},
    createTime: {type: Number, require: true, default: Date.now},
    updateTime: {type: Number, require: true, default: Date.now}
});

RecommendationSchema.pre('save', function (next) {
    this.updateTime = Date.now();
    next();
});

RecommendationSchema.statics.findData = function(appId,language,callback){
    var self = this,strong=[],sub=[],noSub=[],subId=[],noSubId=[];
    self.find({delete:false,Attributes:language,appId:appId},null,{sort: {level: 1}},function(err,data){
        if(err) return callback(err,{strong:strong,sub:sub,noSub:noSub});
        //console.log(data);
        async.mapSeries(data,function(item,cb){
            if(item.isDelete === "NO"){
                strong.push(item);
            }else if(item.isSubscribed === "YES"){
                sub.push(item);
                subId.push(item.menuId);
            }else {
                noSub.push(item);
                noSubId.push(item.menuId);
            }
            cb();
        },function(error,result){
            callback(error,data,{strong:strong,sub:sub,noSub:noSub,subId:subId,noSubId:noSubId});
        });
    });
};

/**
 * 订阅栏目订阅数加1
 * @param id
 * @param callback
 */
//RecommendationSchema.statics.countAdd = function (id,type, callback) {
//    var self = this,query;
//    (type == "add")?query =1:query = -1;
//    self.findOneAndUpdate({_id: id},{$inc:{count:query}}).exec(function (err, recommendation) {
//        callback(err,recommendation.count);
//    });
//};

/**
 * 订阅栏目订阅数加1
 * @param menuId
 * @param callback
 */
RecommendationSchema.statics.addCount = function (menuId, callback) {
    var self = this,query={};
    if(typeof menuId === "object"){
        //console.log("menuId 数组");
        async.map(menuId,function(item,cb){
            self.update({menuId:item},{$inc:{count:1}}).exec(function (err, result) {
                cb();
            });
        },function(err,result){
            callback(err,"success");
        });
    }else {
        //console.log("menuId 字符串");
        query.menuId = menuId;
        self.update(query,{$inc:{count:1}}).exec(function (err, result) {
            console.log(result);
            if(callback) callback(err,result);
        });
    }
};
RecommendationSchema.statics.reduceCount = function (menuId, callback) {
    var self = this,query={};
    if(typeof menuId === "object"){
        //console.log("menuId 数组");
        query.menuId = {$in:menuId};
    }else {
        //console.log("menuId 字符串");
        query.menuId = menuId;
    }
    //console.log(menuId);
    //console.log(query);
    self.update(query,{$inc:{count:-1}}).exec(function (err, result) {
        if(callback) callback(err,result);
    });
};

mongoose.model('Recommendation', RecommendationSchema);