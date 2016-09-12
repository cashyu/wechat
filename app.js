/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var koa = require('koa');
var wechat = require('./wechat/g');
var config = require('./config');
var weixin = require('./weixin');   //自定义模块，主要用于回复


var app = new koa();


app.use(wechat(config.wechat,weixin.reply));

app.listen(1234);

console.log('Listening:1234');