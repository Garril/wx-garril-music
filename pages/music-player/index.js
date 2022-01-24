// pages/music-player/index.js
import { getSongDetail } from '../../service/api_player'

Page({
  data: {
    songDetailInfo: {}, // 请求到的歌曲信息
    currentPage: 0, // 歌曲页 - 0 / 歌词页 - 1
    contentHeight: 0, // 内容/轮播图 的高度

  },
  onLoad: function (options) {
    // 获取歌曲id
    const id = options.id
    // 发请求
    this.getMusicData(id)
    // 计算内容高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight })
  },
  // 网络请求
  getMusicData(id) {
    getSongDetail(id).then(res => {
      this.setData({ songDetailInfo: res.songs[0] })
    })
  },
  // 监听轮播图滚动
  handleSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  }
})