/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
var util = require('./libs/util');
var wechat_file = path.join(__dirname,'./config/wechat.txt');

var config = {
    wechat: {
        appID: 'wxb80e5bddb2d804f3',
        appSecret: '5c556435736411c7c5c155da6018adb2',
        token: 'imoocwechatyuxinhuachat',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);    //转成字符串
            return util.writeFileAsync(wechat_file,data);
        }
    }
};
var app = new koa();

app.use(wechat(config.wechat));

app.listen(1234);

console.log('Listening:1234');