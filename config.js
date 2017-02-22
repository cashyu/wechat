var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname,'./config/wechat.txt');
let wechat_ticket = path.join(__dirname, './config/wechat_ticket.txt');

var config = {
    wechat: {
        /*
        appID: 'wxb4dee46229322cbb',
        appSecret: '54ca2c5eae3dff78da709f550e8d8344',
        token: 'imoocwechatyuxinhuachat',
        */  
        /* 
        appID: 'wxb7090bbaddfd1e67',
        appSecret: '5b35da9232a518df51380d10656f67f1',
        token: 'imoocwechatyuxinhuachat',
        */
        appID: 'wxb80e5bddb2d804f3',
        appSecret: '5c556435736411c7c5c155da6018adb2',
        token: 'imoocwechatyuxinhuachat',
        
        getAccessToken:function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);    //转成字符串
            return util.writeFileAsync(wechat_file,data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket);
        
        },
        saveTicket: function(data){
            data = JSON.stringify(data);    //转成字符串
            return util.writeFileAsync(wechat_ticket,data);
        }
    }
};

module.exports = config;
