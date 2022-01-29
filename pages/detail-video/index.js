// pages/detail-video/index.js
import { getMvUrlById,getMvDetailById,getMvRelatedVideo } from '../../service/api_video'
import { playerStore } from '../../store/index'

Page({
  data: {
    mvURL: {},
    mvDetail: {},
    relatedVideos: [],
    danmuList: [{
      text: '第 1s 出现的弹幕',
      color: '#ff0000',
      time: 1
    }, {
      text: '第 3s 出现的弹幕',
      color: '#ff00ff',
      time: 3
    }],
    isBackMusicPlay: false, // 后台是否有音乐在播放
  },
  onLoad: function (options) {
    const id = options.id
    this.getPageDate(id)
    this.openBackMusicPlayListener()
  },
  getPageDate(id) {
    // 拿视频url
    getMvUrlById(id).then(res => {
      this.setData( {mvURL: res.data })
    })
    // 拿视频详细信息
    getMvDetailById(id).then(res => {
      this.setData( {mvDetail: res.data })
    })
    // 拿相关视频信息
    getMvRelatedVideo(id).then(res => {
      this.setData( {relatedVideos: res.data })
    })
  },
  // 播放/暂停视频 的回调函数
  handleVideoPlay() {
    if(this.data.isBackMusicPlay) { // 在播放，暂停他
      playerStore.dispatch("changeMusicPlayStatusAction",false)
    }
  },
  // 开启后台是否播放音乐监听
  openBackMusicPlayListener() {
    playerStore.onState("isPlaying", res => {
      this.setData({ isBackMusicPlay: res })
    })
  },
  // 关视频后，重新播放音乐
  onUnload() {
    if(!this.data.isBackMusicPlay) { // 没在播放音乐，开启
      // 设置个延时
      setTimeout(() => {
        playerStore.dispatch("changeMusicPlayStatusAction",true)
      },2000)
    }
  }
})