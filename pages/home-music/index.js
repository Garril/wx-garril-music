// pages/home-music/index.js
import { playerStore, rankingStore } from '../../store/index'

import { getBanners,getSongMenu } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

const throttleQueryRect = throttle(queryRect, 1000, {trailing: true} )

Page({
  data: {
    banners: [],
    swiperHeight: 0,
    recommendSongs: [],
    hotSongMenu: [],
    recommendSongMenu: [],
    rankingArr: { 0: {}, 2: {}, 3:{} },
    songDetailInfo: {},
    isPlaying: false,

  },
  onLoad: function (options) {
    // 页面数据--轮播图
    this.getPageData()

    // 调用store的action去发送请求，获取数据
    rankingStore.dispatch("getRankingDataAction")
    
    // 开启对 store 内数据的监听
    this.setupPlayerStoreListener();
  },
  // 封装，监听store中数据变化的 回调,
  // 处理巅峰榜需要的数据到对象中，对象再放到数组中
  getNewRankingHandler(idx) {
    return (res) => {
      if(Object.keys(res).length === 0) return
      const name = res.name
      const signName = res.signName
      const coverImgUrl = res.coverImgUrl
      const playCount = res.playCount
      const ranklist = res.tracks.slice(0,3)
      const obj = { name,coverImgUrl,ranklist,playCount,signName }
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
      url: '/packageDetail/pages/detail-search/index',
    })
  },
  // 轮播-图片加载完成调用
  handleSwiperImageLoaded() {
    // 获取组件的高度
    throttleQueryRect('.swiper-image').then(res => {
      if(res[0] && res[0].height) {
        this.setData({ swiperHeight: res[0].height })
      }
    })
  },
  // 点击推荐歌曲的 更多按钮
  handleRecomMoreClick() {
    this.navToDetailSongs("hotRanking")
  },
  // 点击巅峰榜的3个榜单
  handleRankingMoreClick(event) {
    const signName = event.currentTarget.dataset.signame;
    this.navToDetailSongs(signName)
  },
  // 跳转到榜单对应歌单时调用的函数
  navToDetailSongs(rankingName) {
    wx.navigateTo({
      url: `/packageDetail/pages/detail-songs/index?ranking=${rankingName}&type=rankList`,
    })
  },
  // 处理歌曲点击 
  handleSongItemClick(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playListSongs",this.data.recommendSongs)
    playerStore.setState("playListIndex",index)
  },
  // 播放小组件-播放
  handlePlayClick() {
    playerStore.dispatch("changeMusicPlayStatusAction", !this.data.isPlaying)
  },
  // 播放小组件的点击，进入歌曲页面
  handlePlayBarClick() {
    wx.navigateTo({
      url: '/packagePlayer/pages/music-player/index?id='+ this.data.songDetailInfo.id,
    })
  },
  // 开启监听
  setupPlayerStoreListener() {
    // 从store中获取数据，onState监听变化（包括初始的空数据）offState取消监听

    // 排行榜
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

    // 播放小组件的音乐信息
    playerStore.onStates(["songDetailInfo","isPlaying"], ({songDetailInfo, isPlaying}) => {
      if(songDetailInfo) this.setData({ songDetailInfo })
      if(isPlaying !== undefined) this.setData({ isPlaying }) 
    })

  },
})