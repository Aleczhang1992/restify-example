/**
 * Created by xiayibin on 16/7/12.
 */
'use strict';

const restify = require('restify');
const logger = require('../../utils/logging');
const Recommendation = require('../../models/index').Recommendation;

/**
 * Routes
 */

var routes = [];

/**
 * 用户列表
 * */
//routes.push({
//    meta: {
//        name: 'getUserList',
//        method: 'GET',
//        paths: [
//            '/userList'
//        ],
//        version: '1.0.0'
//    },
//    action: function(req, res, next) {
//        const userId = req.params.id;
//        console.log("getUserList");
//
//        req.acl.hasRole(req.user.userId, "admin", (err, hasRole) => {
//            if (err) throw err;
//            //if (!hasRole && userId != req.user.userId) {
//            //    return next(new restify.errors.ForbiddenError('can not get other user info.'));
//            //}
//
//            Users.find({},(err,data)=>{
//                if(err){
//                    res.send({code:500, err: err});
//                }else {
//                    res.send({code:0, data: data});
//                }
//                return next();
//            });
//        });
//    }
//});

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
            if(err) errCallback(res,err,next,500,"数据库错误");
            if(count>(skip+limit)) isMore = true;
            Recommendation.find(query).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"数据库错误");
                res.send({code:0,list:data,count:count,isMore:isMore});
            });
        });
    }
});

/**
 * Export
 */
module.exports = routes;
