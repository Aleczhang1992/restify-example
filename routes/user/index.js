'use strict';

const restify = require('restify');
const logger = require('../../utils/logging');
const Users = require('../../models/index').Users;

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
 * Export
 */
module.exports = routes;
