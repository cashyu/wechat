'use strict'
let koa = require('koa');
let sha1 = require('sha1');

let config = {
  wechat: {
    appID:'wxb4dee46229322cbb',
    appSecrect:'54ca2c5eae3dff78da709f550e8d8344',
    token:'imoocwechatyuxinhuachat'
  }
};

let app = new koa();
app.use(function *(next) {
  let opts = this;
  console.log(this.query);
  var token = config.wechat.token;
  var signature = this.query.signature;
  var nonce = this.query.nonce;
  var timestamp = this.query.timestamp;
  var echostr = this.query.echostr;
  console.log(token)
  var str = [token,timestamp,nonce].sort().join('');
  var sha = sha1(str);
  if(sha === signature){
    this.body = echostr + '';
  }else{
    this.body = "wrong";
  }

})

app.listen(1234);

console.log('listening:1234');


