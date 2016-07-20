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



