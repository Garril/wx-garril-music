// app.js
App({
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44, // 这里设置了默认，非获取
    deviceRadio: 0 // 一般为1.77几的旧版屏幕 和 2.多的刘海屏
  },
  onLaunch() {
    // 拿到机型信息
    const info = wx.getSystemInfoSync()
    this.globalData.screenHeight = info.screenHeight
    this.globalData.screenWidth = info.screenWidth
    this.globalData.statusBarHeight = info.statusBarHeight
    const deviceRadio = info.screenHeight / info.screenWidth // 高/宽
    this.globalData.deviceRadio = deviceRadio
  }
})
