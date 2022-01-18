// pages/home-music/index.js
Page({
  data: {

  },
  onLoad: function (options) {

  },
  // 点击搜索框
  handleSearchClick() {
    wx.navigateTo({
      url: '../detail-search/index',
    })
  }
})