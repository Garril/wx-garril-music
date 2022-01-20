// pages/home-music/index.js
import { rankingStore } from '../../store/index'

import { getBanners } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

const throttleQueryRect = throttle(queryRect,1000)

Page({
  data: {
    banners: [],
    swiperHeight: 0,
    recommendSongs:[]
  },
  onLoad: function (options) {
    // 页面数据--轮播图
    this.getPageData()
    // 调用store的action去发送请求获取数据
    rankingStore.dispatch("getRankingDataAction")
    // 从store中获取数据
    rankingStore.onState("hotRanking",res=>{
      if(!res.tracks) return
      const recommendSongs = res.tracks.slice(0,6)
      this.setData({ recommendSongs })
    })
  },
  // 发请求获取页面数据
  getPageData() {
    getBanners().then(res => {
      this.setData({ banners: res.banners })
    })
  },
  // 点击搜索框
  handleSearchClick() {
    wx.navigateTo({
      url: '../detail-search/index',
    })
  },
  // 轮播-图片加载完成调用
  handleSwiperImageLoaded() {
    // 获取组件的高度
    throttleQueryRect('.swiper-image').then(res => {
      this.setData({ swiperHeight: res[0].height })
    })
  }
})