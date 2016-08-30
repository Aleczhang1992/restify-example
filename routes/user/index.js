'use strict';

const restify = require('restify');
const logger = require('../../utils/logging');
const Users = require('../../models/index').Users;
const Feedback = require('../../models/index').Feedback;
const async = require('async');
const errCallback = require('../../tools/tool').errCallback;
const nconf = require('../../config');

/**
 * Routes
 */

var routes = [];

/**
 * GET /
 * Version: 1.0.0
 */

routes.push({
    meta: {
        name: 'getUser',
        method: 'GET',
        paths: [
            '/user/:id'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const userId = req.params.id;
        //console.log(req.user.userId);

        req.acl.hasRole(req.user.userId, "admin", (err, hasRole) => {
            if (err) throw err;
            if (!hasRole && userId != req.user.userId) {
                return next(new restify.errors.ForbiddenError('can not get other user info.'));
            }

            const userName = userId == '123' ? "zhangsan" : "tom";
            res.send({
                results: {
                    userName
                }
            });
            return next();
        });
    }
});

/**
 * 用户列表
 * */
routes.push({
    meta: {
        name: 'getUserList',
        method: 'GET',
        paths: [
            '/userList'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const userId = req.params.id;
        console.log("getUserList");

        req.acl.hasRole(req.user.userId, "admin", (err, hasRole) => {
            if (err) throw err;
            //if (!hasRole && userId != req.user.userId) {
            //    return next(new restify.errors.ForbiddenError('can not get other user info.'));
            //}

            Users.find({},(err,data)=>{
                if(err){
                    res.send({code:500, err: err});
                }else {
                    res.send({code:0, data: data});
                }
                return next();
            });
        });
    }
});

/**
 * 删除用户订阅栏目
 * */
routes.push({
    meta: {
        name: 'userRecoDel',
        method: 'POST',
        paths: [
            '/userRecoDel'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let {columnId,appID,language} = req.params;

        Users.find({},function(err,users){
            if(err) errCallback(res,err,next,500,"删除用户订阅栏目-数据库错误-1");
            const lang = appID+"_"+language;
            async.map(users,function(user,callback){
                if(user.recommendation[lang]){
                    async.series([function(done){
                        for(let i=0;user.recommendation[lang].subscribed.indexOf(columnId)>=0;i++){
                            user.recommendation[lang].subscribed.splice(user.recommendation[lang].subscribed.indexOf(columnId),1);
                        }
                        done();
                    },function(done){
                        for(let i=0;user.recommendation[lang].noSubscribed.indexOf(columnId)>=0;i++){
                            user.recommendation[lang].noSubscribed.splice(user.recommendation[lang].noSubscribed.indexOf(columnId),1);
                        }
                        done();
                    },function(done){
                        Users.update({_id:user._id},{$set:{recommendation:user.recommendation}},function(err,num){
                            if(err) errCallback(res,err,next,500,"删除用户订阅栏目-数据库错误-2");
                            done();
                            callback(null,1);
                        });
                    }]);
                }else callback(null,0);
            },function(err,result){
                if (err) errCallback(res,err,next,501,"删除用户订阅栏目-async错误-1");
                res.send({code:0,message:"删除用户订阅栏目成功"});
                next();
            });
        });
    }
});


/**
 * 获取反馈列表
 * */
routes.push({
    meta: {
        name: 'feedbackList',
        method: 'POST',
        paths: [
            '/feedbackList'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { limit=15,skip=0,language,appId} = req.params;
        if(typeof limit === "string") limit = Number.parseInt(limit);
        if(typeof skip === "string") skip = Number.parseInt(skip);

        let query = {};
        if(language) query.language = language;
        if(appId) query.appId = appId;

        let selector = "mail appId phone system content version language createTime",isMore=true,count=0;
        Feedback.count(query).exec((err,num)=>{
            if(err) errCallback(res,err,next,500,"feedbackList-数据库错误-1");
            else {
                count = num;
                Feedback.find(query).sort({ createTime: -1 }).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                    if(err) errCallback(res,err,next,500,"feedbackList-数据库错误-2");
                    else {
                        //if(data.length > limit) {
                        //    isMore = true;
                        //    data.pop();
                        //}
                        if(skip+limit >= count) isMore = false;
                        res.send({ code:0, message:"success",list:data,count:count,isMore:isMore });
                        next();
                    }
                });
            }
        });
    }
});

/**
 * Export
 */
module.exports = routes;
