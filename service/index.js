import { TOKEN_KEY } from '../constants/token-const'

const token = wx.getStorageSync(TOKEN_KEY)

const BASE_URL = "http://123.207.32.32:9001"
const LOGIN_BASE_URL = "http://123.207.32.32:3000"

class EnhanceRequest {
  constructor(baseURL, authHeader = {}) {
    this.baseURL = baseURL
    this.authHeader = authHeader
  }

  request(url, method, params, isAuth = false, header = {}) {
    const finalHeader = isAuth ? {...this.authHeader, ...header} : header

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        method: method,
        header: finalHeader,
        data: params,
        success: function(res) { // 可直接 success(res) {...}
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
  get(url, params, isAuth = false, header) {
    return this.request(url,"GET",params,isAuth,header)
  }
  post(url, data, isAuth = false, header) {
    return this.request(url,"POST",data,isAuth,header)
  }
}
const enhanceRequest = new EnhanceRequest(BASE_URL)

const loginRequest = new EnhanceRequest(LOGIN_BASE_URL,{
  token
})

export default enhanceRequest
export {
  loginRequest
}