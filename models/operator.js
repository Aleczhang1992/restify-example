/**
 * Created by xiayibin on 16/5/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OperatorSchema = new Schema({
    password: {type: String, require: true},
    username: {type: String, require: true},
    level: {type: String, require: true, default:0 },
    createTime: {type: Number, require: true, default: Date.now},
    updateTime: {type: Number, require: true, default: Date.now}
});

OperatorSchema.pre('save', function (next) {
    this.updateTime = Date.now();
    next();
});


mongoose.model('Operator', OperatorSchema);