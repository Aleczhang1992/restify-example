'use strict';

const logger = require('../../utils/logging');
const nconf=require('../../config');
const Version = require('../../models/index').Version;
const errCallback = require('../../tools/tool').errCallback;
/**
 * Routes
 */

const routes = [];

/**
 * GET /
 * Version: 1.0.0
 */

routes.push({
    meta: {
        name: 'getRoot',
        method: 'GET',
        paths: [
            '/'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        // logger.info('access /');
        res.send({
            name: nconf.get('Server:Name')
        });
        return next();
    }
});

routes.push({
    meta: {
        name: 'addVersion',
        method: 'POST',
        paths: [
            '/addVersion'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let { type,appId,version,updateType,updateInfo,downloadUrl} = req.params;
        if(!type || !appId || !version || !updateType || !updateInfo || !downloadUrl){
            errCallback(res,{},next,501,"参数错误");
        }else {
            Version.create({
                type:type,
                appId:appId,
                version:version,
                updateInfo:updateInfo,
                updateType:updateType,
                downloadUrl:downloadUrl
            },function(err,result){
                if(err) {
                    logger.dbLogger.info('db error:'+err);
                    res.send({code:500,message:"db error.",err:err});
                }else res.send({code:0,message:"Add version success.",result:result});
                return next();
            });
        }
    }
});

/**
 * Export
 */

module.exports = routes;
