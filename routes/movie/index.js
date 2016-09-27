/**
 * Created by xiayibin on 16/7/12.
 */
'use strict';

const restify = require('restify');
const async = require('async');
const logger = require('../../utils/logging');
const {Movie} = require('../../models/index');

/**
 * Routes
 */

var routes = [];

// err回调通用函数
const errCallback = function(res,err,next,code,message){
    logger.dbLogger.info('db error:'+err);
    res.send({code:code,message:message,err:err});
    next();
};

/**
 * POST 电影列表
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'getMovieList',
        method: 'POST',
        paths: [
            '/movie/getMovieList'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
    	//参数初始化和获取请求传参
        let { limit=10,skip=0,language=false,title=false,movieId=false} = req.params;
    //格式化
        limit=Number.parseInt(limit);
        skip=Number.parseInt(skip);
        let isMore = false,
        		query = {
            delete:false
        		},
    //筛选项,这里会确定返回库中哪些内容
        selector = "title movieId  count  language country doctor poster flash";
    //根据参数判断，传了什么，即根据对应参数进行筛选，query即查询参数对象
        if(language) query.language=language;
        if(movieId) query.movieId=movieId;
        if(title) query.title= new RegExp(title,"g");
        //返回符合条件的文档数
        Movie.count(query).exec((err,count)=>{
            if(err) errCallback(res,err,next,500,"获取电影-数据库错误-1");
            //分页逻辑
            if(count>(skip+limit)) isMore = true;
            //返回的数据数组
            var data_real = [];
            //进行查库操作
            Movie.find(query).limit(limit).skip(skip).select(selector).exec((err,data)=>{
                if(err) errCallback(res,err,next,500,"获取电影-数据库错误-2");
                //遍历数据库，并将数据返回
                async.map(data,function(item,cb){
//              	console.log("item",item);
                    let item_ = item.toObject();
                    item_.title = item.title;
                    item_.language = item.language;
                    item_.movieId = item.movieId;  
                    item_.country = item.country;
                    item_.doctor = item.doctor;
                    item_.count = item.count;
                    data_real.push(item_);
                    cb();
                },function(err,result){
                    if(err) errCallback(res,err,next,500,"获取电影-数据库错误-1");
                    //从接口返回
                    res.send({code:0,list:data_real,count:count,isMore:isMore});
                    next();
                });
            });
        });
    }
});



/**
 * POST 添加电影
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'addMovie',
        method: 'POST',
        paths: [
            '/movie/addMovie'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        let {movieId=false,title=false,language='zh',country='',doctor='',poster='',flash=''} = req.params;
        if(!movieId||!title) {
            console.log(movieId,title);
            res.send({code:401,message:"缺少参数"});
            next();
        }
        movieId = movieId.replace(/\s/,"");
        Movie.find({movieId: movieId},function(err,data){
            if(err) errCallback(res,err,next,500,"修改电影-数据库错误-0");
            if(data && data.length>0){
                res.send({code:101,message:"该电影Id已经存在"});
                next();
            }else {
                Movie.create({
                    movieId: movieId,
                    poster: poster,
                    title: title,
                    language: language,
                    flash: flash,
                    country: country,
                    doctor: doctor    
                },function (err, result) {
                    if(err) errCallback(res,err,next,500,"修改电影-数据库错误-1");
           
                        res.send({code:0,message:"创建电影成功"});
                        next();
          
                });
            }
        });
    }
});

/**
 * POST 电影更新
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'updateMovie',
        method: 'POST',
        paths: [
            '/movie/updateMovie'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const {movieId=false,title=false,country=false,doctor=false,language=false,poster=false,flash=false,del=false} = req.params;
        if(!movieId) errCallback(res,{},next,401,"缺少参数");
        //这里会报错
//       movieId = movieId.replace(/\s/,"");
        const query = {
            movieId:movieId
        };
        if(title) query.title= title;
        if(language) query.language= language;
        if(country) query.country= country;
        if(doctor) query.doctor= doctor;
        if(poster) query.poster= poster;
        if(flash) query.flash= flash;
        if(del) query.delete= del;
        let n = 0;
        
        async.series([
            function(done){
                Movie.update({movieId:movieId},{$set:query},function(err,num){
                	console.log("xxx");
                    if(err) errCallback(res,err,next,500,"电影更新-数据库错误");
                    if(num.nModified>=1) n=1;
                     if(n>=1) res.send({code:0,message:"更新电影成功"});
                    else res.send({code:1,message:"更新电影失败,未找到电影或电影数据未变化"});
                    done();
                });
            }
        ]);
    }
});

/**
 * POST 电影删除
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'deleteMovies',
        method: 'POST',
        paths: [
            '/movie/deleteMovies'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const { movieIdArr=false } = req.params;
        if(!movieIdArr || typeof movieIdArr !== "object") {
            res.send({code:501,message:"缺少参数"});
            next();
        }
        let failedArr = [],successArr = [];
        async.map(movieIdArr,function(movieId,cb){
            Movie.update({"movieId":movieId,delete:false},{$set:{delete:true}},function(err,num){
                if(err) errCallback(res,err,next,500,"删除电影-数据库错误");
                if(num.nModified>=1) successArr.push({movieId:movieId});
                else failedArr.push({movieId:movieId,message:"未找到栏目或栏目数据未变化"});
                cb();
            });
        },function(err,result){
            if(err) errCallback(res,err,next,500,"删除电影-async错误");
            let message = '删除电影成功';
            if(failedArr.length>0) message = '删除电影失败';
            res.send({code:0,message:message,successArr:successArr,failedArr:failedArr});
            next();
        });
    }
});


/**
 * POST 电影恢复
 * Version: 1.0.0
 */
routes.push({
    meta: {
        name: 'reuseMovies',
        method: 'POST',
        paths: [
            '/movie/reuseMovies'
        ],
        version: '1.0.0'
    },
    action: function(req, res, next) {
        const { movieIdArr=false } = req.params;
        if(!movieIdArr) {
            res.send({code:501,message:"缺少参数"});
            next();
        }
        let failedArr = [],successArr = [];
        async.map(movieIdArr,function(movieId,cb){
            Movie.update({"movieId":movieId,delete:true},{$set:{delete:false}},function(err,num){
                if(err) errCallback(res,err,next,500,"恢复电影-数据库错误");
                if(num.nModified>=1) successArr.push({movieId:movieId});
                else failedArr.push({movieId:movieId,message:"未找到栏目或栏目数据未变化"});
                cb();
            });
        },function(err,result){
            if(err) errCallback(res,err,next,500,"恢复订阅栏目-async错误");
            res.send({code:0,message:"恢复电影成功",successArr:successArr,failedArr:failedArr});
            next();
        });
    }
});


/**
 * Export
 */
module.exports = routes;
