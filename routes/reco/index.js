/**
 * Created by xiayibin on 16/7/12.
 */
'use strict';

const restify = require('restify');
const async = require('async');
const logger = require('../../utils/logging');
const {Recommendation,Users} = require('../../models/index');

/**
 * Routes
 */

var routes = [];

// err回调通用函数
const errCallback = function(res,err,next,code,message){
    logger.dbLogger.info('db error:'+err);
    res.send({code:code,message:message,err:err});
    next();
};

/**
 * POST 订阅栏目列表
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'getColumnsList',
        method: 'POST',
        paths: [
            '/reco/getColumnsList'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { limit=10,skip=0,language=false,appID=false,name=false,columnId=false} = req.params;
        limit=Number.parseInt(limit);
        skip=Number.parseInt(skip);
        let isMore = false,query = {
            delete:false
        },selector = "title menuId type level count appId Attributes isSubscribed isDelete";
        if(language) query.Attributes=language;
        if(appID) query.appId=appID;
        if(columnId) query.menuId=columnId;
        if(name) query.title= new RegExp(name,"g");
        Recommendation.count(query).exec((err,count)=>{
            if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-1");
            if(count>(skip+limit)) isMore = true;
            var data_real = [];
            Recommendation.find(query).sort({ level: 1 }).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-2");
                async.map(data,function(item,cb){
                    let item_ = item.toObject();
                    item_.name = item.title;
                    item_.language = item.Attributes;
                    item_.columnId = item.menuId;
                    item_.index = item.level;
                    item_.appID = item.appId;
                    item_.subCount = item.count;
                    data_real.push(item_);
                    cb();
                },function(err,result){
                    if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-1");
                    res.send({code:0,list:data_real,count:count,isMore:isMore});
                    next();
                });
            });
        });
    }
});

/**
 * POST 被删除的订阅栏目列表
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'getDisabledColumnsList',
        method: 'POST',
        paths: [
            '/reco/getDisabledColumnsList'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { limit=10,skip=0,language=false,appID=false,name=false,columnId=false} = req.params;
        limit=Number.parseInt(limit);
        skip=Number.parseInt(skip);
        let isMore = false,query = {
            delete:true
        },data_real=[],selector = "title menuId type level count appId Attributes isSubscribed isDelete";
        if(language) query.Attributes=language;
        if(appID) query.appId=appID;
        if(columnId) query.menuId=columnId;
        if(name) query.title= new RegExp(name,"g");
        Recommendation.count(query).exec((err,count)=>{
            if(err) errCallback(res,err,next,500,"获取删除的订阅栏目-数据库错误-1");
            if(count>(skip+limit)) isMore = true;
            Recommendation.find(query).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"获取删除的订阅栏目-数据库错误-2");
                Recommendation.find(query).sort({ level: 1 }).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                    if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-2");
                    async.map(data,function(item,cb){
                        let item_ = item.toObject();
                        item_.name = item.title;
                        item_.language = item.Attributes;
                        item_.columnId = item.menuId;
                        item_.index = item.level;
                        item_.appID = item.appId;
                        data_real.push(item_);
                        cb();
                    },function(err,result){
                        if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-1");
                        res.send({code:0,list:data_real,count:count,isMore:isMore});
                        next();
                    });
                });
            });
        });
    }
});

/**
 * POST 添加订阅栏目
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'addColumn',
        method: 'POST',
        paths: [
            '/reco/addColumn'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { columnId=false,name=false,index=999,isDelete='YES',isSubscribed='NO',appID="chinaApp",language='zh',type=0,url=''} = req.params;
        if(!columnId||!name) {
            console.log(columnId,name);
            res.send({code:401,message:"缺少参数"});
            next();
        }
        columnId = columnId.replace(/\s/,"");
        Recommendation.find({menuId: columnId},function(err,data){
            if(err) errCallback(res,err,next,500,"修改订阅栏目-数据库错误-0");
            if(data && data.length>0){
                res.send({code:101,message:"该栏目Id已经存在"});
                next();
            }else {
                Recommendation.create({
                    menuId: columnId,
                    type: type,
                    url: url,
                    title: name,
                    Attributes: language,
                    isSubscribed: isSubscribed,
                    isDelete: isDelete,
                    level: index,
                    appId: appID
                },function (err, result) {
                    if(err) errCallback(res,err,next,500,"修改订阅栏目-数据库错误-1");
                    if(isDelete == "NO") {
                        res.send({code:0,message:"创建不可删除的订阅栏目成功"});
                        next();
                    }else {
                        Users.find({},function(err,users){
                            if(err) errCallback(res,err,next,500,"修改订阅栏目-数据库错误-2");
                            const lang = appID+"_"+language;
                            async.map(users,function(user,callback){
                                if(user.recommendation[lang]){
                                    user.recommendation[lang].noSubscribed.push(columnId);
                                    Users.update({_id:user._id},{$set:{recommendation:user.recommendation}},function(err,num){
                                        if(err) errCallback(res,err,next,500,"修改订阅栏目-数据库错误-3");
                                        callback(null,1);
                                    });
                                }else callback(null,0);
                            },function(err,result){
                                if (err) errCallback(res,err,next,501,"修改订阅栏目-async错误-1");
                                res.send({code:0,message:"创建普通的订阅栏目成功"});
                                next();
                            });
                        });
                    }
                });
            }
        });
    }
});

/**
 * POST 栏目更新
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'updateColumn',
        method: 'POST',
        paths: [
            '/reco/updateColumn'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const { columnId=false,name=false,index=false,isDelete=false,isSubscribed=false,appID=false,language=false,type=false,url=false,del=false} = req.params;
        if(!columnId) errCallback(res,{},next,401,"缺少参数");
        let menuId = columnId.replace(/\s/,"");
        const query = {
            menuId:menuId
        };
        if(name) query.title= name;
        if(index) query.level= index;
        if(isDelete) query.isDelete= isDelete;
        if(isSubscribed) query.isSubscribed= isSubscribed;
        if(appID) query.appID= appID;
        if(language) query.Attributes= language;
        if(type) query.level= type;
        if(url) query.level= url;
        if(del) query.delete= del;
        let n = 0;
        async.series([
            function(done){
                Recommendation.update({"menuId":columnId},{$set:query},function(err,num){
                    if(err) errCallback(res,err,next,500,"订阅栏目更新-数据库错误");
                    if(num.nModified>=1) n=1;
                    //else res.send({code:1,message:"更新栏目失败,未找到栏目或栏目数据未变化"});
                    done();
                });
            },
            function(done){
                if(menuId!=columnId){//TODO 如果是修改订阅栏目的menuId的话,需要改变用户的数据
                    //Users.find({},function(err,users){
                    //    if(err) errCallback(res,err,next,500,"订阅栏目更新-数据库错误-2");
                    //    if(!appID || !language) errCallback(res,err,next,401,"缺少参数");
                    //    console.log("========>");
                    //    const lang = appID+"_"+language;
                    //    async.map(users,function(user,callback){
                    //        if(user.recommendation[lang]){
                    //            user.recommendation[lang].noSubscribed.push(columnId);
                    //            Users.update({_id:user._id},{$set:{recommendation:user.recommendation}},function(err,num){
                    //                if(err) errCallback(res,err,next,500,"订阅栏目更新-数据库错误-3");
                    //                callback(null,1);
                    //            });
                    //        }else callback(null,0);
                    //    },function(err,result){
                    //        if (err) errCallback(res,err,next,501,"订阅栏目更新-async错误-1");
                    //        res.send({code:0,message:"创建订阅栏目成功"});
                    //        done();
                    //    });
                    //});
                    done();
                }else {
                    if(n>=1) res.send({code:0,message:"更新栏目成功"});
                    else res.send({code:1,message:"更新栏目失败,未找到栏目或栏目数据未变化"});
                    done();
                }
            },
            function(done){
                done();
                next();
            }
        ]);
    }
});

/**
 * POST 栏目删除
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'deleteColumns',
        method: 'POST',
        paths: [
            '/reco/deleteColumns'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const { columnIdArr=false } = req.params;
        if(!columnIdArr || typeof columnIdArr !== "object") {
            res.send({code:501,message:"缺少参数"});
            next();
        }
        let failedArr = [],successArr = [];
        async.map(columnIdArr,function(columnId,cb){
            Recommendation.update({"menuId":columnId,delete:false},{$set:{delete:true}},function(err,num){
                if(err) errCallback(res,err,next,500,"删除订阅栏目-数据库错误");
                if(num.nModified>=1) successArr.push({columnId:columnId});
                else failedArr.push({columnId:columnId,message:"未找到栏目或栏目数据未变化"});
                cb();
            });
        },function(err,result){
            if(err) errCallback(res,err,next,500,"删除订阅栏目-async错误");
            let message = '删除栏目成功';
            if(failedArr.length>0) message = '删除栏目失败';
            res.send({code:0,message:message,successArr:successArr,failedArr:failedArr});
            next();
        });
    }
});


/**
 * POST 栏目恢复
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'reuseColumns',
        method: 'POST',
        paths: [
            '/reco/reuseColumns'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const { columnIdArr=false } = req.params;
        if(!columnIdArr) {
            res.send({code:501,message:"缺少参数"});
            next();
        }
        let failedArr = [],successArr = [];
        async.map(columnIdArr,function(columnId,cb){
            Recommendation.update({"menuId":columnId,delete:true},{$set:{delete:false}},function(err,num){
                if(err) errCallback(res,err,next,500,"恢复订阅栏目-数据库错误");
                if(num.nModified>=1) successArr.push({columnId:columnId});
                else failedArr.push({columnId:columnId,message:"未找到栏目或栏目数据未变化"});
                cb();
            });
        },function(err,result){
            if(err) errCallback(res,err,next,500,"恢复订阅栏目-async错误");
            res.send({code:0,message:"恢复栏目成功",successArr:successArr,failedArr:failedArr});
            next();
        });
    }
});


/**
 * Export
 */
module.exports = routes;
