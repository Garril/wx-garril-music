import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../service/api_player'
import { parseLyric } from '../utils/parse-lyric'

const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
  state: {
    isOpen: false, // 记录 audioContext 是否 开启监听

    id: "", // 歌曲id
    songDetailInfo: {}, // 请求到的歌曲信息
    lyricInfos: [], // 歌词信息，对象数组，包含时间和文本内容
    durationTime: 0, // 歌曲播放总时间

    currentTime: 0, // 歌曲播放的当前时间
    currentLyricText: '', // 当前的歌词
    currentLyricIndex: 0, // 当前歌词在数组中的index，防止多次赋值

    playModeIndex: 0, // 0-2 分别代表 循环播放、单曲循环、随机播放
    isPlaying: false, // 歌曲是否在播放

    playListSongs: [], // 播放歌曲列表，用于做上一曲下一曲
    playListIndex: 0, // 歌曲当前在列表中的index
  },
  actions: {
    // 请求并播放音乐，设置监听
    requestPlayMusicById(ctx,{ id, isRefresh = false}) { // 直接对payload进行解构

      if(ctx.id == id && !isRefresh) { // 同一首歌曲
        // 二次点击歌曲，进入播放页面，设置歌曲为播放
        this.dispatch("changeMusicPlayStatusAction",true)
        return
      }
      ctx.id = id // 保存歌曲id
      ctx.isPlaying = true // 修改播放状态

      // 请求歌曲信息前，清空下上一首歌的数据,防止上首歌数据残影
      ctx.songDetailInfo = {}
      ctx.lyricInfos = []
      ctx.durationTime = 0
      ctx.currentTime = 0
      ctx.currentLyricText = ''
      ctx.currentLyricIndex = 0

      // 请求歌曲详情
      getSongDetail(id).then(res => {
        ctx.songDetailInfo = res.songs[0]
        ctx.durationTime = res.songs[0].dt
      })

      // 请求歌词信息
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric
        const lyricInfos = parseLyric(lyricString)
        ctx.lyricInfos = lyricInfos
      })

      // 播放对应id的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 设置监听函数 -- 只需要开第一次
      if(!ctx.isOpen) { 
        this.dispatch("setupAudioContextListenerAction")
        ctx.isOpen = true
      }
    },
    // 设置 audioContext的事件监听 
    setupAudioContextListenerAction(ctx) {
      // 在获取到src的音频流后，会自动调用onCanplay，内部调个play就可以，不用autoplay
      audioContext.onCanplay(() => {
        audioContext.play()
      })

      // 监听 播放时间 变化后（这里处理显示的数据）
      audioContext.onTimeUpdate(() => {
        // 获取当前时间
        const currentTime = audioContext.currentTime * 1000

        // 播放条 随播放时间移动,先判断是否在滑动修改，避免冲突
        // if(!this.data.isSliderChanging) {
        //   // 改变当前播放时间数据，和显示
        //   const sliderValue = currentTime / this.data.durationTime * 100
        //   this.setData({ sliderValue, currentTime })
        // }
        
        ctx.currentTime = currentTime
        // Page1--根据当前时间去查找播放的歌词
        if(!ctx.lyricInfos.length) return
        let i  = 0
        for(; i < ctx.lyricInfos.length; i++) {
          const lyricInfo = ctx.lyricInfos[i]
          if(currentTime < lyricInfo.time) {
            break // 找到当前时间对应歌词位置，不需要继续遍历下去了
          }
        }
        // 设置当前索引和内容
        const rightIndex = i-1
        if(ctx.currentLyricIndex !== rightIndex ) {
          // 处理某些 特殊！歌曲时候，前半段没ctx.lyricInfos[rightIndex]报错
          if( ctx.lyricInfos[rightIndex] && ctx.lyricInfos[rightIndex].text) {
            const currentLyricText = ctx.lyricInfos[rightIndex].text
            ctx.currentLyricText = currentLyricText
            ctx.currentLyricIndex = rightIndex
          }
          // this.setData({ 
          //   currentLyricText,
          //   currentLyricIndex: i-1,
          //   lyricScrollTop: (i-1) * 35
          // })
        }
      })

      // 监听 歌曲播放完成
      audioContext.onEnded(() => {
        this.dispatch("changeCurMusicPlayAction")
      })
    },
    // 改变播放状态
    changeMusicPlayStatusAction(ctx,isPlaying = true) {
      ctx.isPlaying = isPlaying
      if(ctx.isPlaying) { // 在播放
        audioContext.play()
      } else {
        audioContext.pause()
      }
    },
    // 上一首歌 和 下一首歌
    changeCurMusicPlayAction(ctx,isNext = true) {
      // 获取当前索引
      let index = ctx.playListIndex
      let t = index
      // 根据播放模式找下一首歌index
      switch(ctx.playModeIndex) {
        case 0: // 顺序播放
          index = isNext? index + 1 : index -1
          if(index === -1) index = cxt.playListSongs.length - 1
          if(index === ctx.playListSongs.length) index = 0
          break
        case 1: // 单曲循环
          break
        case 2: // 随机播放
          t = index
          do {
            index = Math.floor(Math.random() * ctx.playListSongs.length)
          } while(t == index)
          break
      }
      // 取得index对应歌曲
      let currentSong = ctx.playListSongs[index]
      if(!currentSong) { // 错误处理，直接当前歌曲不变
        currentSong = ctx.songDetailInfo
      } else {
        // 播放新的歌曲
        ctx.playListIndex = index
        ctx.songDetailInfo = currentSong
      }
      this.dispatch("requestPlayMusicById",{ id: currentSong.id , isRefresh: true })
    },

  }
})
export {
  audioContext,
  playerStore
}