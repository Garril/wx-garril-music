// pages/music-player/index.js
import { getSongDetail } from '../../service/api_player'
import { audioContext } from '../../store/index'

Page({
  data: {
    songDetailInfo: {}, // 请求到的歌曲信息
    currentPage: 0, // 歌曲页 - 0 / 歌词页 - 1
    contentHeight: 0, // 内容/轮播图 的高度
    isMusicLyricShow: true, // 歌词是否要显示--设备宽高比
    durationTime: 0, // 歌曲播放总时间
    currentTime: 0, // 歌曲播放的当前时间
    sliderValue: 0, // 进度条的值  0~100
    isSliderChanging: false, // 播放条是否在被滑动修改，防止播放和滑动同时修改sliderValue，导致滑动条显示抽搐效果
  },
  // 网络请求
  getMusicData(id) {
    getSongDetail(id).then(res => {
      this.setData({ songDetailInfo: res.songs[0], durationTime: res.songs[0].dt })
    })
  },
  // 监听轮播图滚动
  handleSwiperChange(event) {
    this.setData({ currentPage: event.detail.current })
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
    // 高比宽，小于2的时候，歌词不显示
    if(globalData.deviceRadio < 2) {
      this.setData({ isMusicLyricShow: false })
    }
    // 创建播放器---到首页外头，也要显示播放的歌曲，而且这里创建的是局部变量
    // 页面播放的时候，其实是调用了这个audioContext，用了闭包。也不好管理
    // const audioContext = wx.createInnerAudioContext()
    // audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // audioContext.autoplay = true

    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // audioContext.autoplay = true
    // 在获取到src的音频流后，会自动调用onCanplay，内部调个play就可以，不用autoplay
    audioContext.onCanplay(() => {
      audioContext.play()
    })

    // 监听 播放时间 变化后（这里处理显示的数据）
    audioContext.onTimeUpdate(() => {
      const currentTime = audioContext.currentTime * 1000
      // 播放条 随播放时间移动,先判断是否在滑动修改，避免冲突
      if(!this.data.isSliderChanging) {
        // 改变当前播放时间数据，和显示
        const sliderValue = currentTime / this.data.durationTime * 100      
        this.setData({ sliderValue, currentTime })
      }
    })

  },
  // 监听 播放条点击
  handleSliderChange(event) {
    // 获取变化后的值
    const value =  event.detail.value // 0到100的值

    // 点击后，应该跳转到的播放时间
    const currentTime = this.data.durationTime * value/100

    // 设置context播放对应时间的音乐
    audioContext.pause()
    audioContext.seek(currentTime / 1000) // 这里要求传秒s
    // seek跳转后，缓存好了对应片段就会调用onCanplay()去自动播放
    // 对应的播放条，做相应变化，以及改变isSliderChanging
    this.setData({ sliderValue: value, isSliderChanging: false })
  },
  // 监听 播放条滑动，一旦滑动松手，就会触发handleSliderChange，相当于点击
  handleSliderChanging(event) {
    // 表明正在滑动修改播放条
    this.setData({ isSliderChanging: true })
    const value = event.detail.value // 滑动到的值
    const currentTime = this.data.durationTime * value/100 // 应该显示的、滑动后的播放时间
    this.setData({ currentTime })
  },

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