// pages/music-player/index.js
import { audioContext, playerStore } from '../../../store/index'

// 播放模式名字数组
const playModeMap = ["order","repeat","random"]

Page({
  data: {
    songDetailInfo: {}, // 请求到的歌曲信息
    lyricInfos: [], // 歌词信息，对象数组，包含时间和文本内容
    durationTime: 0, // 歌曲播放总时间
    
    currentTime: 0, // 歌曲播放的当前时间
    currentLyricText: '', // 当前的歌词
    currentLyricIndex: 0, // 当前歌词在数组中的index，防止多次赋值
    playModeIndex: 0, // 歌曲播放模式
    isPlaying: false, // 歌曲是否在播放
    // 上述都在store中获取
    
    playModeName: "order", // 歌曲播放模式名字，用于图片src动态写入
    playStatusName: "pause", // 播放状态--暂停和播放。自动播放，默认显示暂停
    currentPage: 0, // 歌曲页 - 0 / 歌词页 - 1
    contentHeight: 0, // 内容/轮播图 的高度
    isMusicLyricShow: true, // 歌词是否要显示--设备宽高比
    sliderValue: 0, // 进度条的值  0~100
    isSliderChanging: false, // 播放条是否在被滑动修改，防止播放和滑动同时修改sliderValue，导致滑动条显示抽搐效果
    lyricScrollTop: 0, // 歌词滚动高度
  },
  // ============= 监听轮播图滚动 =============
  handleSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
  },

  onLoad: function (options) {
    // 获取歌曲id
    // const id = options.id

    // 去store，获取歌曲信息
    this.setupPlayerStoreListener()

    // 计算内容高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight })
    // 高比宽，小于2的时候，歌词不显示
    if(globalData.deviceRadio < 2) {
      this.setData({ isMusicLyricShow: false })
    }
    // 创建播放器---到首页外头，也要显示播放的歌曲，而且这里创建的是局部变量
    // 页面播放的时候，其实是调用了这个audioContext，用了闭包。也不好管理
    // 这里的思路：放到store的action里面，请求完信息后让他播放
    // const audioContext = wx.createInnerAudioContext()
    // audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // audioContext.autoplay = true
  },

  // ============= 监听 播放条点击 =============
  handleSliderChange(event) {
    // 获取变化后的值
    const value =  event.detail.value // 0到100的值

    // 点击后，应该跳转到的播放时间
    const currentTime = this.data.durationTime * value/100

    // 设置context播放对应时间的音乐
    // audioContext.pause() 变成后台播放后，不做暂停了
    audioContext.seek(currentTime / 1000) // 这里要求传秒s
    // seek跳转后，缓存好了对应片段就会调用onCanplay()去自动播放
    // 对应的播放条，做相应变化，以及改变isSliderChanging
    this.setData({ sliderValue: value, isSliderChanging: false })
  },

  // ============= 监听 播放条滑动，一旦滑动松手，就会触发handleSliderChange，相当于点击 =============
  handleSliderChanging(event) {
    // 表明正在滑动修改播放条
    this.setData({ isSliderChanging: true })
    const value = event.detail.value // 滑动到的值
    const currentTime = this.data.durationTime * value/100 // 应该显示的、滑动后的播放时间
    this.setData({ currentTime })
  },
  // 下面监听时调用的函数，方便取消监听时调用
  handleCurrentSongInfo({songDetailInfo,lyricInfos,durationTime}) {
    if(songDetailInfo) this.setData({ songDetailInfo })
    if(lyricInfos) this.setData({ lyricInfos })
    if(durationTime) this.setData({ durationTime })
  },
  handleCurrentLyricInfo({currentTime,currentLyricText,currentLyricIndex}) {
    // 时间变化
    if(currentTime && !this.data.isSliderChanging) {
      const sliderValue = currentTime / this.data.durationTime * 100
      this.setData({ currentTime, sliderValue })
    }
    // 歌词变化
    if(currentLyricIndex) {
      this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35  })
    }
    if(currentLyricText) this.setData({ currentLyricText })
  },
  handlePlayModeInfo({playModeIndex,isPlaying}) {
    if(playModeIndex !== undefined) {
      this.setData({ 
        playModeIndex,
        playModeName: playModeMap[playModeIndex],
      })
    }

    if(isPlaying !== undefined) {
      this.setData({
        isPlaying,
        playStatusName: isPlaying ? "pause": "resume"
      })
    }
  },

  // 对store里面保存的歌曲信息进行监听 --- 获取信息
  setupPlayerStoreListener() {

    // 监听 "songDetailInfo","lyricInfos","durationTime"，返回含这3属性的对象，直接解构
    playerStore.onStates(["songDetailInfo","lyricInfos","durationTime"], this.handleCurrentSongInfo)

    // 监听 "currentTime","currentLyricText","currentLyricIndex"
    playerStore.onStates(["currentTime","currentLyricText","currentLyricIndex"], this.handleCurrentLyricInfo)
    // {
    //   currentTime,
    //   currentLyricText,
    //   currentLyricIndex
    // }) => {
    //   // 时间变化
    //   if(currentTime && !this.data.isSliderChanging) {
    //     const sliderValue = currentTime / this.data.durationTime * 100
    //     this.setData({ currentTime, sliderValue })
    //   }
    //   // 歌词变化
    //   if(currentLyricIndex) {
    //     this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35  })
    //   }
    //   if(currentLyricText) this.setData({ currentLyricText })
    // })

    // 监听播放模式：playModeIndex
    playerStore.onStates(["playModeIndex","isPlaying"], this.handlePlayModeInfo)
  },
  // 返回功能
  handleBackBtnClick() {
    wx.navigateBack()
  },

  // 循环播放模式
  handleModeClick() {
    const newPlayModeIndex = (this.data.playModeIndex + 1) % 3
    // this.setData({ playModeIndex: newPlayModeIndex }) -- 要改变store的，而不是自己的(不会动态改变)
    playerStore.setState("playModeIndex", newPlayModeIndex)
  },

  // 暂停/播放
  handlePlayStatus() {
    // 单单设置变量isPlaying，只是改变变量而已，要改变audioContext，到store去
    playerStore.dispatch("changeMusicPlayStatusAction",!this.data.isPlaying)
  },

  // 上一首
  handlePreSongClick() {
    playerStore.dispatch("changeCurMusicPlayAction",false)
  },
  // 下一首
  handleNextSongClick() {
    playerStore.dispatch("changeCurMusicPlayAction",true)
  },
  // 取消监听
  onUnload() {
    // offStates有错误，暂时不用
    // playerStore.offStates(["songDetailInfo","lyricInfos","durationTime"], this.handleCurrentSongInfo)
    // playerStore.offStates(["currentTime","currentLyricText","currentLyricIndex"], this.handleCurrentLyricInfo)
    // playerStore.offStates(["playModeIndex","isPlaying"], this.handlePlayModeInfo)
  }
})

// 思路：
// handleSliderChanging 播放条滑动的时候： 
// 给滑动条value和当前播放时间 这两变量上锁！ 
// ---最后触发handleSliderChange和onTimeUpdate（只是onTimeUpdate这时运行不了）

// handleSliderChange 播放条点击的时候： 
// 改变滑动条的value，调用seek进行播放进度跳跃，同时 给两变量解锁！
// ---最后触发onTimeUpdate

// audioContext.onTimeUpdate 监听播放时间（上面两函数），如果没有上锁的情况下:
// 改变双向绑定的数据: 滑动条value 和 当前播放时间