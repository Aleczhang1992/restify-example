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
        const { limit=10,skip=0,language='zh',name='',appID='',columnId=''} = req.params;
        //console.log(limit,skip,language,name,appID,columnId);
        let isMore = false,query = {
            Attributes:language
        },selector = "title menuId type level count";
        if(columnId) query.menuId = columnId;
        Recommendation.count(query).exec((err,count)=>{
            if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-1");
            if(count>(skip+limit)) isMore = true;
            Recommendation.find(query).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"获取订阅栏目-数据库错误-2");
                res.send({code:0,list:data,count:count,isMore:isMore});
                next();
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
        const { limit=10,skip=0,language='zh',name='',appID='',columnId=''} = req.params;
        let isMore = false,query = {
            delete:true,
            Attributes:language
        },selector = "title menuId type level count";
        if(columnId) query.menuId = columnId;
        Recommendation.count(query).exec((err,count)=>{
            if(err) errCallback(res,err,next,500,"获取删除的订阅栏目-数据库错误-1");
            if(count>(skip+limit)) isMore = true;
            Recommendation.find(query).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"获取删除的订阅栏目-数据库错误-2");
                res.send({code:0,list:data,count:count,isMore:isMore});
                next();
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
        const { columnId=false,name=false,index=999,isDelete='YES',isSubscribed='NO',appID='chinaApp',language='zh',type=0,url=''} = req.params;
        if(!columnId||!name) {
            res.send({code:401,message:"缺少参数"});
            next();
        }
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
                    res.send({code:0,message:"创建订阅栏目成功"});
                    next();
                });
            });
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
        const query = {};
        if(name) query.title= name;
        if(index) query.level= index;
        if(isDelete) query.isDelete= isDelete;
        if(isSubscribed) query.isSubscribed= isSubscribed;
        if(appID) query.appID= appID;
        if(language) query.Attributes= language;
        if(type) query.level= type;
        if(url) query.level= url;
        if(del) query.delete= del;

        Recommendation.update({"menuId":columnId},{$set:query},function(err,num){
            if(err) errCallback(res,err,next,500,"订阅栏目更新-数据库错误");
            //console.log(num);
            if(num.nModified>=1) res.send({code:0,message:"更新栏目成功"});
            else res.send({code:1,message:"更新栏目失败,未找到栏目或栏目数据未变化"});
            next();
        });
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
        const { columnId=false } = req.params;
        if(!columnId) {
            res.send({code:501,message:"却少参数"});
            next();
        }
        Recommendation.update({"menuId":columnId,delete:false},{$set:{delete:true}},function(err,num){
            if(err) errCallback(res,err,next,500,"删除订阅栏目-数据库错误");
            //console.log(num);
            if(num.nModified>=1) res.send({code:0,message:"删除栏目成功"});
            else res.send({code:1,message:"删除栏目失败,未找到栏目或栏目已被删除"});
            next();
        });
    }
});





/**
 * Export
 */
module.exports = routes;
