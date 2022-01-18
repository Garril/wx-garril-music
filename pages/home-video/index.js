// pages/home-video/index.js
import { getTopMv } from '../../service/api_video'

Page({
  data: {
    topMvs: [],
    hasMore: true, // 判断下拉，是否还有视频可以加载
  },
  onLoad(options) {
    this.getTopMvData(0)
  },
  onReachBottom() {
    this.getTopMvData(this.data.topMvs.length)
  },
  // 最顶端，下拉刷新
  onPullDownRefresh() {
    this.getTopMvData(0)
  },
  // 封装的重复的代码-发请求
  async getTopMvData(offset) {
    // 没有数据可以请求了，往上拉就直接return,加个offset!=0是为了顶部下拉加载
    if(!this.data.hasMore && offset !== 0) return
    // 显示加载动画
    wx.showNavigationBarLoading()
    // 发送请求
    const res = await getTopMv(offset)
    let newData = this.data.topMvs
    if(offset===0) { // 顶部往下拉刷新，直接请求新数据
      newData = res.data
    } else { // 底部往上拉加载，数据拼到数组后面
      newData = newData.concat(res.data)
    }
    this.setData({ topMvs: newData })
    this.setData({ hasMore: res.hasMore })
    // 移除加载动画
    wx.hideNavigationBarLoading()
    if(offset === 0) {
      wx.stopPullDownRefresh() // 顶部下拉，主动停止动画，否则一直显示加载动画，要手动取消
    }
  },

})