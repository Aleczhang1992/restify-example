# 中国网新闻后台
---

## 安装和运行

需要的Node.js版本`v6.2.0`

安装所需库：

```
npm install -dd
```

开发环境下运行：

```
npm start
```

生产环境下运行：

```
NODE_ENV=production npm start
```

测试：

```
npm test
```

## 实现的功能
---

* 针对路由的支持：见`routes`下的示例
* 对跨域访问（CORS）的支持: 见`/app.js`和`/utils/corsHelper.js`
* 对全局配置的支持：配置文件在`/config/global.{dev|product}.json`，设置为`global.config`，方便其他文件引用
* 基于`Mocha`的自动测试，可在`/test/routes/`下加入自己route的测试代码
* 集成`Winston`日志
* 基于JWT的认证
* 基于[NODE ACL](https://github.com/OptimalBits/node_acl)的ACL


## api接口

* methord: POST
* url: http://ch.dev.selcome.com/china/v1/checkVersion
```
request:{
    "appId": "chinaApp",
    "version": "0.0.1",
    "type": "android"   // "ios"
}
response:{
    "code":0, 
    "message":"success", 
    "info":{ 
        "updateType": 0, //0-不需要更新，1-非强制更新，2-强制更新
        "updateInfo": "版本更新内容",
        "newVersion": "1.2.1",
        "downloadUrl": "http:…."
    }
}
```


* methord: POST
* url: http://chapp.selcome.com/china/v1/feedbackList  正式服地址
```
request:{
    "skip": 0,
    "limit": 15,
    "appId": "chinaApp",
    "language": "zh"
}
response:{
    "code":0, 
    "message":"success", 
    "list":[ 
        {
            "mail": "username@mail.com",
            "appId": "chinaApp",
            "phone": "iphone 6s Plus", //手机型号
            "system": "ios 9.1.9",     //手机操作系统版本号
            "content": "反馈的实际内容,特殊字符需要转义",
            "version": "1.0.6",  //app的版本号
            "language": "zh",
            "createTime" "1472105409303"
        }
    }
}
```

