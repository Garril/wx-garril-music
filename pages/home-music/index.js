// pages/home-music/index.js
import { rankingStore } from '../../store/index'

import { getBanners,getSongMenu } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

const throttleQueryRect = throttle(queryRect,1000)

Page({
  data: {
    banners: [],
    swiperHeight: 0,
    recommendSongs: [],
    hotSongMenu: [],
    recommendSongMenu: [],
    rankingArr: { 0: {}, 2: {}, 3:{} },

  },
  onLoad: function (options) {
    // 页面数据--轮播图
    this.getPageData()
    // 调用store的action去发送请求，获取数据
    rankingStore.dispatch("getRankingDataAction")
    // 从store中获取数据，onState监听变化（包括初始的空数据）offState取消监听
    rankingStore.onState("hotRanking",res=>{
      if(!res.tracks) return
      const recommendSongs = res.tracks.slice(0,6)
      this.setData({ recommendSongs })
    })
    // 新歌榜
    rankingStore.onState("newSongsRanking",this.getNewRankingHandler(0))
    // 原创榜
    rankingStore.onState("originRanking",this.getNewRankingHandler(2))
    // 飙升榜
    rankingStore.onState("rushRanking",this.getNewRankingHandler(3))
    // 上面3次调用getNewRankingHandler，返回的都undefined。拿到3个榜单的数据
    // 如果3个榜单要按顺序，那么就不要push进数组了，把数组变成对象obj:{ idx: value }
    // getNewRankingHandler要传 参数idx，idx对应obj初始化好的属性名
    // 让getNewRankingHandler去return 一个箭头函数，函数内容为现在getNewRankingHandler的内容。
  },
  // 封装，监听store中数据变化的 回调,
  // 处理巅峰榜需要的数据到对象中，对象再放到数组中
  getNewRankingHandler(idx) {
    return (res) => {
      if(Object.keys(res).length === 0) return
      const name = res.name
      const coverImgUrl = res.coverImgUrl
      const playCount = res.playCount
      const ranklist = res.tracks.slice(0,3)
      const obj = { name,coverImgUrl,ranklist,playCount }
      // const newRankingArr = [...this.data.rankingArr]
      // newRankingArr.push(obj)
      const newRankingArr = {...this.data.rankingArr,[idx]:obj} // [idx]:value -- idx是动态，idx：value -- idx是静态
      this.setData({ rankingArr: newRankingArr })
    }
  },
  // 发请求获取页面数据
  getPageData() {
    getBanners().then(res => {
      this.setData({ banners: res.banners })
    })
    getSongMenu().then(res => {
      this.setData({ hotSongMenu: res.playlists })
    })
    getSongMenu("流行").then(res => {
      this.setData({ recommendSongMenu: res.playlists })
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