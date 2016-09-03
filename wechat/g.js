/**
 * Created by Administrator on 2016/9/3.
 */
'use strict'

var sha1 = require('sha1');

var config = {
    wechat: {
        appID: 'wxb80e5bddb2d804f3',
        appSecret: '5c556435736411c7c5c155da6018adb2',
        token: 'imoocwechatyuxinhuachat'
    }
};

module.exports = function(opts){
    return function *(next){
        console.log(this.query);
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token,timestamp,nonce].sort().join('');
        var sha = sha1(str);

        if(sha === signature){
            this.body = echostr + '';
        }else{
            this.body = "wrong";
        }

    }
};
