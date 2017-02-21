var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname,'./config/wechat.txt');

var config = {
    wechat: {
        /*
        appID: 'wxb4dee46229322cbb',
        appSecret: '54ca2c5eae3dff78da709f550e8d8344',
        token: 'imoocwechatyuxinhuachat',
        */  
  
        appID: 'wxb7090bbaddfd1e67',
        appSecret: '5b35da9232a518df51380d10656f67f1',
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

module.exports = config;
