'use strict'

var config = require('./config');
var Wechat = require('./wechat/wechat');


var wechatApi = new Wechat(config.wechat);

exports.reply = function *(next){   //next用来向下传递流程
    var message = this.weixin;

    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){  //订阅事件
            if(message.EventKey){   //判断是否是二维码订阅
                console.log('扫描二维码：'+message.EventKey + ' '
                    + message.ticket);
            }
            this.body = '哈哈，你订阅了这个号\r\n';
        }else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
            this.body = '';
            //上报地理位置事件，如果用户同意了上报，则用户每次打开公众号，都会上报一次地理位置
        }else if(message.Event === 'LOCATION') {
            this.body = '您上报的位置是：' + message.Latitude + '/' +
                message.Longitude + '-' + message.Precision;
            //点击了菜单
        }else if(message.Event === 'CLICK'){
            this.body = '您 了菜单：' + message.EventKey;
            //扫描
        }else if(message.event === 'SCAN') {
            console.log('关注后扫二维码' + message.EventKey + ' ' +
                message.Ticket);
            this.body = "看到你扫一下哦";
        }else if(message.Event === 'VIEW'){
            this.body = '您点击了菜单中的链接:' + message.EventKey;
        }
    }else {   //如果是文本类型
        var content = message.Content;
        var reply = '额，你说的' + message.Content + '太复杂了';

        //指定回复策略，比如回复1时，公众号做什么操作，回复2时，公众号做另外的操作
        if(content === '1'){
            reply = '天下第一吃大米';
        }else if(content === '2'){
            reply = "天下第二吃豆腐"
        }else if(content === '3'){
            reply = "天下第三吃西瓜"
        }else if(content === '4'){
            reply = [{
                title:'技术改变世界',
                description:"只是一个描述而已",
                picUrl:'http://ww4.sinaimg.cn/square/7bfc0806gw1f7q1rxnegyj20p00xctbr.jpg',
                url:'https://github.com/'
            },{
                title:'nodejs 微信开发',
                description:"只是测试一下",
                picUrl:'http://ww1.sinaimg.cn/thumbnail/005AWTo8jw1f7le64nnxaj305z06iq35.jpg',
                url:'https://nodejs.org/'
            }];
        }else if(content === '5'){
            var data = yield wechatApi.uploadMaterial('image',__dirname +
                '/2.jpg');

            reply = {
                type:'image',
                media_id:data.media_id
            };
        }else if(content === '6'){
            var data = yield wechatApi.uploadMaterial('video',__dirname +
                '/6.mp4');
            reply = {
                type:'video',
                title:'回复视频测试',
                description:'视频描述',
                media_id:data.media_id
            };
        }else if(content === '7'){
            var data = yield wechatApi.uploadMaterial('image',__dirname +
                '/2.jpg');
            reply = {
                type:'music',
                title:'回复音乐测试',
                description:'音乐描述',
                musicUrl:'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
                thumbMediaId:data.media_id
            };
        }else if(content === '8') {
            var data = yield wechatApi.uploadMaterial('image', __dirname +
                '/2.jpg',{type:'image'});   //第三个参数permanent
            reply = {
                type: 'image',
                media_id: data.media_id
            };
        }else if(content === '9') {
            var data = yield wechatApi.uploadMaterial('video', __dirname +
                '/6.mp4',{type:'video',description:'{"title":"Really a nice place","introduction":"Never think it so easy"}'});   //第三个参数permanent

            reply = {
                type: 'video',
                title:'回复视频',
                description:'视频的描述信息',
                media_id: data.media_id
            };
        }else if(content === '10') {
            console.log("####################");

            //先获取图片对象
            var picData = yield wechatApi.uploadMaterial('image', __dirname +
                '/2.jpg',{});   //第三个参数为空对象，说明上传的为永久素材
            //传永久素材的目的是为了拿到这个图片的素材ID，然后上传图文
            console.log(picData.media_id);
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
            var media = {
                articles :[{
                    title:'tututu',
                    thumb_media_id:picData.media_id,
                    author:'Along',
                    digest:'摘要',
                    show_cover_pic:1,
                    content:'没有内容',
                    content_source_url:'https://github.com'
                }]
            };
            //上传永久图文素材
            data = yield wechatApi.uploadMaterial('news',media,{});
            console.log(data);
            //获取永久图文素材
            data = yield wechatApi.fetchMaterial(data.media_id,'news',{});
            console.log("@@@@@@@@@@@@@@@@@@@");
            console.log(data);

            var items = data.news_item;
            var news = [];

            items.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.digest,
                    picUrl:picData.url,
                    url:item.url
                });
            });
            reply = news;
        }

        this.body= reply;
    }


    yield next ;
};


