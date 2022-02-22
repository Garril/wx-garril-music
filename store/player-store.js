import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../service/api_player'
import { parseLyric } from '../utils/parse-lyric'

// const audioContext = wx.createInnerAudioContext()
const audioContext = wx.getBackgroundAudioManager()
// getBackgroundAudioManager要到app.json中加权限"requiredBackgroundModes": ["audio"]
// 而且除了src，还要传一个必传的参数：title

const playerStore = new HYEventStore({
  state: {
    isOpen: false, // 记录 audioContext 是否 开启监听
    isStop: false, // 记录 后台音乐播放是否被 关闭 -- 要重新赋值src

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
    // ================== 请求并播放音乐，设置监听 ==================
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
        audioContext.title = res.songs[0].name
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
      audioContext.title = id // 请求、拿到歌曲信息后再去设置成name

      // 设置监听函数 -- 只需要开第一次
      if(!ctx.isOpen) { 
        this.dispatch("setupAudioContextListenerAction")
        ctx.isOpen = true
      }
    },
    //================== 设置 audioContext的事件监听 ==================
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

      // 监听 歌曲(自然)播放完成
      audioContext.onEnded(() => {
        this.dispatch("changeCurMusicPlayAction")
      })

      // 监听音乐暂停/播放 -- 更换成后台的audioContext后要加的（保证后台暂停，小程序内部也变化保持一致）
      audioContext.onPlay(() => {
        // 没有必要 dispatch 调其他action
        ctx.isPlaying = true
      })
      audioContext.onPause(() => {
        ctx.isPlaying = false
        ctx.isStop = true
      })
      /** 上面会造成另外一种现象：利用音乐滑动条，改变播放进度的时候，会有一瞬间。播放状态快速 从播放到暂停 切换
       * 原因就是在音乐滑动条那里设置了暂停，避免同时修改播放时间，但是那里的暂停，会触发上面的onPause，改变了isPlaying
       * isPlaying为false，使得组件内监听的变量改变，icon改变，但是加载完成后，快速调用onCanplay，又触发了onPlay，就变回来了
       * 处理方法： 加一个变量判断，让onPause不每次都变化，或者在滑动的时候不暂停。考虑到ios上onCanplay实机使用，偶尔不灵
       * 所以选择了 滑动时候 不暂停
      */

      // 后台停止
      audioContext.onStop(() => {
        ctx.isPlaying = false
      })
      // ios后台控制 -- 上一曲 --- 
      audioContext.onPrev(() => {
        this.dispatch("changeCurMusicPlayAction",false)
      })
      // ios后台控制 -- 下一曲
      audioContext.onNext(() => {
        this.dispatch("changeCurMusicPlayAction",true)
      })

    },
    // ================== 改变播放状态 ==================
    changeMusicPlayStatusAction(ctx,isPlaying = true) {
      ctx.isPlaying = isPlaying
      if(ctx.isPlaying && ctx.isStop) {
        // 重新设置对应的信息
        audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`
        audioContext.title = ctx.songDetailInfo.name // 请求、拿到歌曲信息后再去设置成name
        audioContext.autoplay = true
        ctx.isStop = false
      }
      if(ctx.isPlaying) { // 在播放
        audioContext.play()
      } else {
        audioContext.pause()
      }
    },
    // ================== 上一首歌 和 下一首歌 ==================
    changeCurMusicPlayAction(ctx,isNext = true) {
      // 获取当前索引
      let index = ctx.playListIndex
      let t = index
      // 根据播放模式找下一首歌index
      switch(ctx.playModeIndex) {
        case 0: // 顺序播放
          index = isNext? index + 1 : index -1
          if(index === -1) index = ctx.playListSongs.length - 1
          if(index === ctx.playListSongs.length) index = 0
          break
        case 1: // 单曲循环
          break
        case 2: // 随机播放
          if(ctx.playListSongs.length === 1 || ctx.playListSongs.length === 0) {
            break // 处理如果只有1首，防止下面while死循环
          }
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