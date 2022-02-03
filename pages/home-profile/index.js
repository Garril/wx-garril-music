// pages/home-profile/index.js
import { getUserInfo } from '../../service/api_login'

Page({
  data: {
    userInfo: {}
  },
  handleGetUser: async function(event) {
    const userInfo = await getUserInfo()
    this.setData({ userInfo })
  },
  handleGetPhoneNumber: function(event) {
    // console.log(event)
  }
})