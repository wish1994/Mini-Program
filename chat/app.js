//app.js
var MD5 = require('/utils/MD5.js');
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var cusid = this.globalData.NLPCusid;
    if (cusid == null || cusid.length < 20){
      this.setCusid();
    }
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    NLPAppkey: "80ccf2fdeba243f49c014af42f571e25",
    NLPAppSecret: "22cd5040b9d347f2b338eeb46f1770be",
    NLPUrl: "https://cn.olami.ai/cloudservice/api",
    NLPCusid:"",    slikToCharUrl:"https://api.happycxz.com/test/silk2asr/olami/asr",
  },
  setCusid:function(){
    var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    var cusidLength = 30,cusid = '';
    for(var i = 0; i < cusidLength; i++){
      var oneStr = str.charAt(Math.floor(Math.random() * str.length));
      cusid += oneStr;
    }
    this.globalData.NLPCusid = cusid;
    console.log("[Console log]:New cusid:" + cusid);
  },

  NLIRequest:function(corpus,arg) {
    var that = this;
    var appkey = that.globalData.NLPAppkey;
    var appSecret = that.globalData.NLPAppSecret;
    var api = "nli";
    var timestamp = new Date().getTime();
    var sign = MD5.md5(appSecret + "api=" + api + "appkey=" + appkey + "timestamp=" + timestamp + appSecret);
    var rqJson = { "data": { "input_type": 1, "text": corpus }, "data_type": "stt" };
    var rq = JSON.stringify(rqJson);
    var nliUrl = that.globalData.NLPUrl;
    var cusid = that.globalData.NLPCusid;
    console.log("[Console log]:NLIRequest(),URL:" + nliUrl);
    wx.request({
      url: nliUrl,
      data: {
        appkey: appkey,
        api: api,
        timestamp: timestamp,
        sign: sign,
        rq: rq,
        cusid: cusid,
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
        var resData = res.data;
        console.log("[Console log]:NLIRequest() success...");
        console.log("[Console log]:Result:");
        console.log(resData);
        var nli = JSON.stringify(resData);
        typeof arg.success == "function" && arg.success(nli);
        
      },
      fail: function (res) {
        console.log("[Console log]:NLIRequest() failed...");
        console.error("[Console log]:Error Message:" + res.errMsg);
        typeof arg.fail == "function" && arg.fail();
      },
      complete: function () {
        console.log("[Console log]:NLIRequest() complete...");
        typeof arg.complete == "function" && arg.complete();
      }
    })
  },
})