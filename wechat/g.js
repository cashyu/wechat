/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');



module.exports = function(opts,handler){
    var wechat = new Wechat(opts); //new出的Wechat，管理票据和微信接口
    
    return function *(next){
        var that = this;
        console.log("------------");
        console.log(this.query);
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token,timestamp,nonce].sort().join('');
        var sha = sha1(str);
        if(this.method === 'GET'){
            if(sha === signature){
                this.body = echostr + '';
            }else{
                this.body = "wrong";
            }
        }else if(this.method === 'POST'){
             if(sha !== signature){
                this.body = "wrong";
                return false;
            }else{
                //获取原始的XML数据
                var data = yield getRawBody(this.req,{
                    length:this.length, //POST过来的数据的长度
                    limit:'1mb',    //最大post过来数据的大小
                    encoding:this.charset   //编码，设置为当前的charset
                });
                //新建一个util.js文件（工具包文件），存放常用的方法
                //parseXMLAsync方法解析xml，返回一个解析后的xml的对象
                var content = yield util.parseXMLAsync(data);    //parseXMLAsync方法返回一个Promise对象
                console.log("$$$$$$$$$$$$$$$");
                console.log(content);
                
                //上面返回的解析后的XML对象还不是标准的key-value的形式，所以还需要格式化
                var message = util.formatMessage(content.xml);
                console.log(message);
                console.log('+++++++++++++++++++++++++++');

                this.weixin= message;
                yield handler.call(this,next);  //执行控制器handler的call方法，来改变上下文
                
                //上面控制器call方法运行完以后，继续执行下面
                wechat.reply.call(this);    //回复

            }
        }
    }
};
