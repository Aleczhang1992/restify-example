/**
 * Created by xiayibin on 16/8/25.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var FeedbackSchema = new Schema({
    mail: {type: String, require: true },
    appId: {type: String, require: true},
    phone: {type: String, require: true},
    system: {type: String, require: true},
    content: {type: String, require: true},
    version: {type: String, require: true},
    language: {type: String, require: true},
    delete: {type: Boolean, default: false},
    createTime: {type: Number, require: true, default: Date.now},
    updateTime: {type: Number, require: true, default: Date.now}
});

//FeedbackSchema.pre('save', function (next) {
//    this.updateTime = Date.now();
//    next();
//});


mongoose.model('Feedback', FeedbackSchema);