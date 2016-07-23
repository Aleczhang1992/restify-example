'use strict';

const restify = require('restify');
const logger = require('../../utils/logging');
const Users = require('../../models/index').Users;
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
 * 用户列表
 * */
routes.push({
    meta: {
        name: 'checkVersion',
        method: 'POST',
        paths: [
            '/checkVersion'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { version,appId,language="zh",type="android"} = req.params;
        //console.log("checkVersion");
        if(!version||!appId) errCallback(res,{},next,409,"缺少版本号或者应用id");
        version = version.replace(/\./ig,"");
        let myVersion = nconf.get('Versions:'+appId+":"+type+':version');
        myVersion = myVersion.replace(/\./ig,"");
        let updateType = 0,updateInfo="不需要更新",newVersion="",downloadUrl="";
        //console.log(myVersion,version);
        if(Number.parseInt(myVersion)>=Number.parseInt(version)){
            updateType = nconf.get('Versions:'+appId+":"+type+':updateType');
            updateInfo = nconf.get('Versions:'+appId+":"+type+':updateInfo');
            newVersion = nconf.get('Versions:'+appId+":"+type+':version');
            downloadUrl = nconf.get('Versions:'+appId+":"+type+':downloadUrl');
        }
        res.send({
            code:0,
            message:"success",
            info:{
                updateType:updateType,//0-不需要更新，1-非强制更新，2-强制更新
                updateInfo:updateInfo,
                newVersion:newVersion,
                downloadUrl:downloadUrl
            }
        });
        next();
    }
});

/**
 * Export
 */
module.exports = routes;
