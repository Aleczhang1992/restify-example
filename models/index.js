/**
 * Created by xiayibin on 16/7/12.
 */
'use strict';
const nconf = require('../config');
const mongoose = require('mongoose');
const logger = require('../utils/logging');

//mongoose.connect(nconf.get('Mongodb:Mongo'), function (err) {
	//env.MONGO_PORT_27017_TCP_ADDR是在.bash_profile中配置的环境变量
mongoose.connect('mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+':27017/test_server', function (err) {
    if (err) {
        logger.dbLogger.info('connect to %s error: ', nconf.get('Mongodb:Name'), err.message);
        process.exit(1);
    }else {
        logger.dbLogger.info('%s DB is running...',nconf.get('Mongodb:Name'));
    }
});


require('./users');
require('./operator');
require('./movie');

//用Model创建Entity

exports.Users = mongoose.model('Users');
exports.Operator = mongoose.model('Operator');

exports.Movie = mongoose.model('Movie');


