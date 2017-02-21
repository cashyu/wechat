'use strict'

var xml2js = require('xml2js');

var Pomise = require('bluebird');

var tpl = require('./tpl');

exports.parseXMLAsync = function(xml){
    return new Pomise(function(resolve,reject){
        xml2js.parseString(xml,{trim:true},function(err,content){
            if(err) reject(err);
            else resolve(content);
        })
    });
};

function formatMessage(result){
    var message = {};

    if(typeof result === 'object'){
        var keys = Object.keys(result)  //拿到result的所有key

        for(var i = 0;i < keys.length;i++){
            //拿到每个key对应的value
            var item = result[keys[i]]; //拿到value
            var key = keys[i];  //拿到key

            if((!item instanceof Array) || item.length ===0){    //先判断是不是数组，再判断长度是不是0 
                continue;
            } 
            if(item.length === 1){
                var val = item[0];
                if(typeof val === 'object'){
                    message[key] = formatMessage(val);
                }else{
                    message[key] = (val || '').trim();    //trim去掉首位的空格
                }
            }else{
                message[key] = [];
                for(var j = 0,k = item.length;j < k;j++){
                    message[key].push(formatMessage(item[j]))
                }
            } 
        }
    }
    return message;
}

exports.formatMessage = formatMessage;
exports.tpl = function(content,message){
    var info = {};   //临时存储回复的内容
    var type = 'text';
    var fromUsername = message.FromUserName;
    var toUsername = message.ToUserName;
    if(Array.isArray(content)){ //如果是数组,将类型改为news
        type = 'news';
    }

    type= content.type　||　type;
    info.content = content;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.toUserName = fromUsername;
    info.fromUserName = toUsername;

    return tpl.compiled(info);

};













