// app.js
import { getLoginCode, codeToToken, checkToken, checkSession } from './service/api_login'
import { TOKEN_KEY } from './constants/token-const'

App({
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44, // 这里设置了默认，非获取
    deviceRadio: 0 // 一般为1.77几的旧版屏幕 和 2.多的刘海屏
  },
  async onLaunch() {
    // 拿到机型信息
    const info = wx.getSystemInfoSync()
    this.globalData.screenHeight = info.screenHeight
    this.globalData.screenWidth = info.screenWidth
    this.globalData.statusBarHeight = info.statusBarHeight
    const deviceRadio = info.screenHeight / info.screenWidth // 高/宽
    this.globalData.deviceRadio = deviceRadio
    // 默认登录
    const token = wx.getStorageSync(TOKEN_KEY)
    // 有无token，且要判断是否过期，还有session_key是否过期
    const checkResult = await checkToken(token)
    // 微信自动判断session_key是否过期，不用传参数。看wx.checkSession的回调
    const isSessionExpire = await checkSession()
    if(!token || checkResult.errorCode || !isSessionExpire) {
      this.loginAction()
    }
  },
  async loginAction() {
    // 获取code
    const code = await getLoginCode()
    // 将code发给服务器
    const result = await codeToToken(code)
    const token = result.token
    wx.setStorageSync(TOKEN_KEY,token)
  }
})
