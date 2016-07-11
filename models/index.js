/**
 * Created by xiayibin on 16/7/12.
 */
'use strict';
const nconf = require('../config');
const mongoose = require('mongoose');
const logger = require('../utils/logging');

mongoose.connect(nconf.get('Mongodb:Mongo'), function (err) {
    if (err) {
        logger.dbLogger.info('connect to %s error: ', nconf.get('Mongodb:Name'), err.message);
        process.exit(1);
    }else {
        logger.dbLogger.info('%s DB is running...',nconf.get('Mongodb:Name'));
    }
});

require('./comments');
require('./like');
require('./users');
require('./recommendation');
require('./operator');
exports.Users = mongoose.model('Users');
exports.Likes = mongoose.model('Likes');
exports.Comments = mongoose.model('Comments');
exports.Recommendation = mongoose.model('Recommendation');
exports.Operator = mongoose.model('Operator');