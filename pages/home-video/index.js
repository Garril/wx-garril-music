// pages/home-video/index.js
import { getTopMv } from '../../service/api_video'

Page({
  data: {
    topMvs: [],
  },
  
  onLoad: function (options) {
    // 直接在这里调用wx.request,其内部调用this.setData,有指向问题
    getTopMv(0).then(res => {
      this.setData( { topMvs: res.data.data })
    })
  },

})