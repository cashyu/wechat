var path = require('path');
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

module.exports = config;