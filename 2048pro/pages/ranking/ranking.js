// pages/ranking/ranking.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: [{
      url: "../../image/dog.jpg",
      nickname: "wishchan1",
      bestscore: "55555"
    }, {
      url: "../../image/pig.jpg",
      nickname: "wishchan2",
      bestscore: "4444"
    }],
    userin: [{
      url: "../../image/wishchan.jpg",
      name: "wishchan",
      best: 666666
    }],
    rankuser: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.selectUser();
    this.ranking();
    this.rankuser();
  },

  //用户排名
  rankuser: function () {
  },
  //排行榜
  ranking: function () {
    var userinfo = [];
  },
  //用户信息
  selectUser: function () {
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})