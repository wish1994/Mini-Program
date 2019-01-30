//index.js

var app = getApp();
var that;
var chatListData = [];
var speakerInterval;
Page({
  data: {
    defaultCorpus:'你都会什么',
    askWord: '',
    sendButtDisable:true,
    userInfo: {},
    chatList: [],
    scrolltop:'',
    userLogoUrl:'/res/image/user_default.png',
    keyboard:true,
    isSpeaking:false,
    speakerUrl:'/res/image/speaker0.png',
    speakerUrlPrefix:'/res/image/speaker',
    speakerUrlSuffix:'.png',
    filePath:null,
    contactFlag:true,
  },
  onLoad: function () {
    console.log("[Console log]:Loading...");
    that = this;
    app.getUserInfo(function (userInfo) {
      var aUrl = userInfo.avatarUrl;
      if(aUrl != null){
        that.setData({
          userLogoUrl: aUrl
        });
      }
    });
    this.sendRequest(this.data.defaultCorpus);
  },

  onReady: function () {
    
  },
  // 切换语音输入和文字输入
  switchInputType:function(){
    this.setData({
      keyboard: !(this.data.keyboard),
    })
  },
  // 监控输入框输入
  Typing:function(e){
    var inputVal = e.detail.value;
    var buttDis = true;
    if(inputVal.length != 0){
      var buttDis = false;
    }
    that.setData({
      sendButtDisable: buttDis,
    })
  },
  // 按钮按下
  touchdown:function(){
    this.setData({
      isSpeaking : true,
    })
    that.speaking.call();
    console.log("[Console log]:Touch down!Start recording!");
    wx.startRecord({
      'success':function(res){
        var tempFilePath = res.tempFilePath;
        that.data.filePath = tempFilePath;
        console.log("[Console log]:Record success!File path:" + tempFilePath);
        that.voiceToChar();
      },
      'fail':function(){
        console.log("[Console log]:Record failed!");
        wx.showModal({
          title: '录音失败',
          content:'换根手指再试一次！',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#09BB07',
        })
      },
    });
  },
  // 按钮松开
  touchup:function(){
    wx.stopRecord();
    console.log("[Console log]:Touch up!Stop recording!");
    this.setData({
      isSpeaking: false,
      speakerUrl: '/res/image/speaker0.png',
    })
    clearInterval(that.speakerInterval);
  },
  // 语音转文字
  voiceToChar:function(){
    var urls = app.globalData.slikToCharUrl;
    var voiceFilePath = that.data.filePath;
    if(voiceFilePath == null){
      console.log("[Console log]:File path do not exist!");
      wx.showModal({
        title: '录音文件不存在',
        content: '我也不知道哪错了，反正你就再试一次吧！',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#09BB07',
      })
      return;
    }
    var appkey = app.globalData.NLPAppkey;
    var appsecret = app.globalData.NLPAppSecret;
    var NLPCusid = app.globalData.NLPCusid;
    wx.showLoading({
      title: '语音识别中...',
    })
    wx.uploadFile({
      url: urls,
      filePath: voiceFilePath,
      name: 'file',
      formData: { "appKey": appkey, "appSecret": appsecret, "userId": NLPCusid },
      header: { 'content-type': 'multipart/form-data' },
      success: function (res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var seg = JSON.parse(data.result).seg;
        console.log("[Console log]:Voice to char:" + seg);
        if(seg == null || seg.length == 0){
          wx.showModal({
            title: '录音识别失败',
            content: "我什么都没听到，你再说一遍！",
            showCancel: false,
            success: function (res) {
            }
          });
          return;
        }
        that.addChat(seg, 'r');
        console.log("[Console log]:Add user voice input to chat list");
        that.sendRequest(seg);
        return;
      },
      fail: function (res) {
        console.log("[Console log]:Voice upload failed:" + res.errMsg);
        wx.hideLoading();
        wx.showModal({
          title: '录音识别失败',
          content: "请你离WIFI近一点再试一次！",
          showCancel: false,
          success: function (res) {
          }
        });
      }
    });
  },
  // 发送语料到语义平台
  sendChat: function (e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    console.log("[Console log]:User input:" + word);
    that.addChat(word, 'r');
    console.log("[Console log]:Add user input to chat list");
    that.setData({
      askWord: '',
      sendButtDisable: true,
    });
    that.sendRequest(word);
  },
  // 发送请求到语义平台
  sendRequest(corpus){
    app.NLIRequest(corpus, {
      'success': function (res) {
        if (res.status==='error') {
          wx.showToast({
            title: '返回数据有误！',
          })
          return;
        }
        var resjson = JSON.parse(res);
        if (corpus == '你都会什么' || corpus=='你会什么'){
          resjson={
            'data':{
              'nli': [{ 
                'desc_obj': { "result":'我会讲笑话，讲故事，聊天，算24点，查时间，查天气，单位换算，汇率换算，查邮政编码等等，你多试试就知道了~~【Tips:有需要加微信号wish1994】', "status": 0},
                "semantic": [{ "app": "chatfunction", "input": "你都会什么", "slots": [], "modifier": [], "customer": "58df4fc184ae11f0bb7b4877" }], 
                "type": "chatfunction"
              }]
            },
            "status": "ok"
          }
        }
        if (corpus == '你主人是谁' || corpus == '你主人叫啥' || corpus == '你主人叫什么') {
          resjson = {
            'data': {
              'nli': [{
                'desc_obj': { "result": '成唯实，微信号wish1994', "status": 0 },
                "semantic": [{ "app": "chatfunction", "input": "你都会什么", "slots": [], "modifier": [], "customer": "58df4fc184ae11f0bb7b4877" }],
                "type": "chatfunction"
              }]
            },
            "status": "ok"
          }
        }
        if (corpus == '成唯实' || corpus == '成唯实是谁') {
          resjson = {
            'data': {
              'nli': [{
                'desc_obj': { "result": '我最亲爱的主人，微信号wish1994', "status": 0 },
                "semantic": [{ "app": "chatfunction", "input": "你都会什么", "slots": [], "modifier": [], "customer": "58df4fc184ae11f0bb7b4877" }],
                "type": "chatfunction"
              }]
            },
            "status": "ok"
          }
        }
        var data = JSON.stringify(resjson.data);
        that.NLIProcess(data);
      },
      'fail': function (res) {
        wx.showToast({
          title: '请求失败！',
        })
        return;
      }
    }); 
  },
  // 处理语义
  NLIProcess: function(res){
    var nlires = JSON.parse(res);
    var nliArray = nlires.nli;
    if(nliArray == null || nliArray.length == 0)    {
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    var answer = nliArray[0].desc_obj.result;
    if(answer == null){
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    console.log("[Console log]:Add answer to chat list...");
    that.addChat(answer, 'l');
    var dataArray = nliArray[0].data_obj;
    if(dataArray != null && dataArray.length > 0){
      var objType = nliArray[0].type;
      if(objType == 'selection' && dataArray.length > 1){
        that.newsProcess(dataArray);
        return;
      }
      if (objType == 'news' && dataArray.length == 1) {
        console.log("[Console log]:Add news to chat list...");
        var title = dataArray[0].title;
        var detail = dataArray[0].detail;
        var news = title + "\n" + detail; 
        that.addChat(news, 'l');
        return;
      }
      var content = dataArray[0].content;
      if (content != null && content != answer){
        console.log("[Console log]:Add content to chat list...");
        that.addChat(content, 'l');
      }
    }
    return;
  },
  // 新闻类处理
  newsProcess(selectionArray){
    console.log("[Console log]:Selection display...");
    for(var i = 0; i < selectionArray.length; i++){
      var title = selectionArray[i].title;
      var detail = selectionArray[i].detail;
      var selectiondetail = "[第" + (i+1) + "条]:" + title + "\n" + detail;
      that.addChatWithFlag(selectiondetail, 'l',false);
    }
  },
  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function (word, orientation) {
    that.addChatWithFlag(word, orientation,true);
  },
  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function (word, orientation, scrolltopFlag){
    let ch = { 'text': word, 'time': new Date().getTime(), 'orientation': orientation };
    chatListData.push(ch);
    var charlenght = chatListData.length;
    console.log("[Console log]:Add message to chat list...");
    if (scrolltopFlag){
      console.log("[Console log]:Rolling to the top...");
      that.setData({
        chatList: chatListData,
        scrolltop: "roll" + charlenght,
      });
    }else{
      console.log("[Console log]:Not rolling...");
      that.setData({
        chatList: chatListData,
      });
    }
  },
  // 分享功能
  onShareAppMessage: function (res) {
    console.log("[Console log]:Sharing the app...");
    return {
      desc: '智能聊',
      desc: '智能聊，比你还能聊~',
      path: 'pages/index/index',
      imageUrl: '/res/image/chat_logo.png',
      success: function (res) {
        console.log("[Console log]:Share app success...");
        console.log("[Console log]:" + res.errMsg);
      },
      fail: function (res) {
        console.log("[Console log]:Share app fail...");
        console.log("[Console log]:" + res.errMsg);
      }
    }
  },
  // 联系作者
  contactMe:function(){
    if(that.data.contactFlag){
	  // 语义平台自定义回复
      that.sendRequest("需要替换内容");
    }
    else{
      wx.showModal({
        title: '提示',
        content: '你都点过了，还点干嘛！！',
        showCancel:false,
      });
    }
    that.data.contactFlag = false;
  },
  // 麦克风帧动画 
  speaking:function() {
    //话筒帧动画 
    var i = 0;
    that.speakerInterval = setInterval(function () {
      i++;
      i = i % 7;
      that.setData({
        speakerUrl: that.data.speakerUrlPrefix + i + that.data.speakerUrlSuffix,
      });
      console.log("[Console log]:Speaker image changing...");
    }, 300);
  }
})
