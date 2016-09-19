

'use strict'
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));    //将request进行promise化

var util = require('./util');

var fs = require('fs');
var _ = require('lodash');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken:prefix +
    'token?grant_type=client_credential',
    temporary:{
        upload:prefix + 'media/upload?',    //上传临时素材
        fetch:prefix + 'media/get?'       //获取临时素材
    },
    permanent:{
        upload:prefix + 'material/add_material?',   //上传永久素材
        fetch:prefix + 'material/get_material?',    //获取永久素材
        del:prefix + 'del_material?',               //删除永久素材
        update:prefix + 'material/update_news?',    //更新永久素材
        count:prefix + 'get_materialcount?',        //获取永久素材的数量
        batch:prefix + 'material/batchget_material?',   //获取永久素材的列表
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?'
    }
};


function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();    //初始化
}

Wechat.prototype.fetchAccessToken = function(data){
    var that = this;
    /*
    如果已经有了access_token，并且有了有效期,且没有过期
    */
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
        }
    }
    //否则通过外部的方式获取一下
    this
    .getAccessToken()
    .then(function(data){
        try {
            data = JSON.parse(data);
        }
        catch(e){
            return that.updateAccessToken(data);
        }

        if(that.isValidAccessToken(data)){
            return Promise.resolve(data)
        }else{
            return that.updateAccessToken();
        }
    })
    .then(function(data){

        that.access_token = data.access_token;
        that.expires_in = data.expires_in;

        that.saveAccessToken(data);

        return Promise.resolve(data);
    })
};


Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }else{
        var access_token = data.access_token;
        var expires_in = data.expires_in;
        var now = (new Date().getTime());

        if(now < expires_in){
            return true;
        }else{
            return false;
        }
    }
};

Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve,reject){
        request({url:url,json:true}) //向服务器发起请求(GET,POST.....)
            .then(function(response){
                var data = response.body;
                console.log("+++++++++++");
                console.log(data);
                var now = (new Date().getTime());
                var expires_in = now + (data.expires_in - 20)*1000; //考虑延时，提前20s刷新token

                data.expires_in = expires_in;

                resolve(data);
            })
    })
};


Wechat.prototype.uploadMaterial = function(type,material,permanent){
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;

    if(permanent){
        uploadUrl = api.permanent.upload;
        _.extend(form,permanent);   //form继承permanent
    }

    if(type === 'pic'){ //如果是图片则，传进来的是字符串的路径
        uploadUrl = api.permanent.uploadNewsPic;
    }

    if(type === 'news'){    //如果是图文，则传进来的是数组
        uploadUrl = api.permanent.uploadNews;
        form = material;
    }else{
        form.media = fs.createReadStream(material);   //创建可读的流
    }
/*
    var form = {
        media: fs.createReadStream(filepath)    //创建可读的流
    };
*/
    return new Promise(function(resolve,reject){
        that
        .fetchAccessToken()
        .then(function(data){
            var url = uploadUrl + 'access_token=' + data.access_token;
            //如果不是永久素材，是临时的素材
            if(!permanent){
                url += '&type=' + type;
            }else{
                form.access_token = data.access_token;
            }
            //定义上传的参数
            var options = {
                method:'POST',
                url: url,
                json:true
            };

            if(type === 'news'){
                options.body = form;
            }else {
                options.formData = form;
            }

            //通过request发起一个请求
            request(options)
            .then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{  //throw抛出异常
                    throw new Error('upload material fails');
                }
            })//catch捕获异常
            .catch(function(err){
                reject(err);
            })
        });
    });
};

//mediaId:素材ID
//type：素材类型
//permanent:获取临时的还是永久的，如果permanent参数存在，则获取永久的
Wechat.prototype.fetchMaterial = function(mediaId,type,permanent){
    var that = this;
    var fetchUrl = api.temporary.fetch;

    if(permanent){
        fetchUrl = api.permanent.fetch;
    }
    console.log(mediaId);
    return new Promise(function(resolve,reject){
        that
        .fetchAccessToken()
        .then(function(data){
            console.log(data);
            var url = fetchUrl + 'access_token=' + data.access_token;
            var options = {method:'POST',url:url,json:true};
            var form = {};
            if(permanent){  //如果是获取永久素材，则在body里面追加
                form.media_id = mediaId;
 //               form.access_token = data.access_token;
                options.body = form;
                console.log("!!!!!!!!!!!!!!!!!!!!!");
            }else{
                //如果是临时素材，则在url后面追加
                //如果该临时素材是视频文件，则url要换为http协议
                if(type === 'video'){
                    //请注意，视频文件不支持https下载，调用该接口需http协议。
                    url = url.replace('https://','http://');
                }
                url += '&media_id=' + mediaId;
                resolve(url);
            }
            console.log("%%%%%%%%%%%%%%%");
            if(type === 'news' || type === 'video'){
                request(options)
                .then(function(response){
                    console.log(response.body);
                    var _data = response.body;
                    if(_data){
                        resolve(_data);
                    }else{  //throw抛出异常
                        throw new Error('Fetch material fails');
                    }
                })
                .catch(function(err){
                    reject(err);
                });
            }

            /*
            //如果临时的素材,且类型为video
            if(!permanent && type === 'video'){
                url = url.replace('https://','http://');//请注意，视频文件不支持https下载，调用该接口需http协议。
            }
            */
        });
    });
};

//mediaId:素材ID
Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this;
    var form = {
        media_id:mediaId
    };

    return new Promise(function(resolve,reject){
        that
        .fetchAccessToken()
        .then(function(data){
            var url = api.permanent.del + 'access_token=' + data.access_token +
                '&media_id=' + mediaId;


            //通过request发起一个请求
            request({method:'POST',url:url,body:form,json:true})
            .then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{  //throw抛出异常
                    throw new Error('Delete material fails');
                }
            })
        });
    });
};


//mediaId:素材ID
//news:改成什么样子
Wechat.prototype.updateMaterial = function(mediaId,news){
    var that = this;
    var form = {
        media_id:mediaId
    };

    _.extend(form,news);    //form继承传进来的news
    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.update + 'access_token=' + data.access_token +
                    '&media_id=' + mediaId;

                //通过request发起一个请求
                request({method:'POST',url:url,body:form,json:true})
                    .then(function(response){
                        var _data = response.body;
                        if(_data){
                            resolve(_data);
                        }else{
                            throw new Error('Update material fails');
                        }
                    })
            });
    });
};


Wechat.prototype.countMaterial = function(){
    var that = this;

    return new Promise(function(resolve,reject){
        that
        .fetchAccessToken()
        .then(function(data){
            var url = api.permanent.count + 'access_token=' + data.access_token;

            //通过request发起一个请求
            request({method:'GET',url:url,json:true})
            .then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('Update material fails');
                }
            })
        });
    });
};

//获取永久素材的列表
//options是一个对象：type，获取素材的类型，offset，从第几个开始获取，count，获取多少个素材
Wechat.prototype.batchMaterial = function(options){
    var that = this;

    options.type = options.type || 'image';
    options.offset = options.offset || 0;
    options.count = options.count || 1;

    return new Promise(function(resolve,reject){
        that
        .fetchAccessToken()
        .then(function(data){
            var url = api.permanent.batch + 'access_token=' + data.access_token;

            //通过request发起一个请求
            request({method:'POST',url:url,body:options,json:true})
            .then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('Batch material fails');
                }
            })
        });
    });
};

Wechat.prototype.reply= function(){
    var content = this.body ;       //通过this渠道外层业务（因为是外层调用）
    var message = this.weixin;


    var xml = util.tpl(content,message);    //采用util的方法（自己定义）获取到xml
    console.log(xml);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
};

module.exports= Wechat;





