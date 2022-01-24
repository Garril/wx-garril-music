// app.js
App({
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44, // 这里设置了默认，非获取
  },
  onLaunch() {
    // 拿到机型信息
    const info = wx.getSystemInfoSync()
    this.globalData.screenHeight = info.screenHeight
    this.globalData.screenWidth = info.screenWidth
    this.globalData.statusBarHeight = info.statusBarHeight
  }
})
