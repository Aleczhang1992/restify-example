/**
 * Created by xiayibin on 16/7/21.
 */
const logger = require('../utils/logging');

// err回调通用函数
const errCallback = function(res,err,next,code,message){
    logger.dbLogger.info('db error:'+err);
    res.send({code:code,message:message,err:err});
    next();
};


/**
 * Export
 */
module.exports = {errCallback};