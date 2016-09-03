/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var koa = require('koa');
var wechat = require('./wechat/g');
var sha1 = require('sha1');

var config = {
    wechat: {
        appID: 'wxb80e5bddb2d804f3',
        appSecret: '5c556435736411c7c5c155da6018adb2',
        token: 'imoocwechatyuxinhuachat'
    }
};
var app = new koa();

app.use(wechat(config.wechat));

app.listen(1234);

console.log('Listening:1234');