/**
 * Created by yuansc on 15/6/23.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    mail: {type: String, index: true, unique: true, sparse: true},
    mobile: {type: String, unique: true, sparse: true, index: true},
    thirdType: {type: String, enum: ['facebook', 'sina', 'qq', 'weixin'], sparse: true, index: true},
    thirdId: {type: String, sparse: true, index: true, unique: true},
    password: {type: String, require: true},
    username: {type: String, require: true,default: 'c1000'},
    avatar: {type: String, require: true},
    recommendation: {type:Object,default:{}},
    delete: {type:Boolean,require: true, default: false},    //用户是否被禁用
    createTime: {type: Number, require: true, default: Date.now},
    updateTime: {type: Number, require: true, default: Date.now}
});

UserSchema.pre('save', function (next) {
    this.updateTime = Date.now();
    next();
});


UserSchema.methods.isMatch = function (plaintext) {
    return this.password == plaintext;
};


/**
 * 根据mail 添加用户
 * @param info
 * @param callback
 */
UserSchema.statics.addByMail = function (info, callback) {
    var self = this;
    var query = {};
    query.mail = info.mail;
    query.password = info.password;
    query.avatar = info.avatar;
    query.username = info.username;
    self.count({}).exec(function(err,num){
        if(!err && !query.username) query.username = "c"+(1001+num);
        self.findOne({mail: info.mail}).exec(function (err, user) {
            if (user) {
                callback('registed');
            } else {
                var doc = new self(query);
                doc.save(callback);
            }
        });
    });
};


UserSchema.statics.mailFindBackPassword = function (mail, callback) {
    var self = this;
    return self.findOne({mail: mail}).exec(function (err, user) {
        //todo send mail and callback
    });
};


/**
 *
 * @param mail
 */
UserSchema.statics.getUserByMail = function (mail) {
    var self = this;
    return self.findOne({mail: mail});
};

/**
 * @param thirdId
 * @param thirdType
 */
UserSchema.statics.getUserByThird = function (thirdId, thirdType) {
    var self = this;
    return self.findOne({thirdId: thirdId, thirdType: thirdType});
};

/**
 *
 * @param mobile
 * @returns {Query|*}
 */
UserSchema.statics.getUserByMobile = function (mobile) {
    var self = this;
    return self.findOne({mobile: mobile});
};

mongoose.model('Users', UserSchema);