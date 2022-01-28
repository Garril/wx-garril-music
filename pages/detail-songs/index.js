import { rankingStore, playerStore } from "../../store/index"
import { getSongListDetail } from "../../service/api_music"

// pages/detail-songs/index.js
Page({
  data: {
    rankingName: "",
    rankingInfo: {}, // 把每一次，榜单对应的歌曲和歌单对应的歌曲 覆盖放到rankingInfo
    type: "", // type区分榜单和歌单
  },
  onLoad: function (options) {
    const type = options.type
    this.setData({ type })
    if(type === "rankList") {
      const rankingName = options.ranking
      this.setData({ rankingName })
      rankingStore.onState(rankingName,this.getRankingDataHandle)
    } else if (type === "songList") {
      const id = options.id
      getSongListDetail(id).then(res => {
        this.setData({ rankingInfo: res.playlist })
      })
    }

  },
  onUnload: function () {
    if(this.data.rankingName) {
      rankingStore.offState(this.data.rankingName,this.getRankingDataHandle)
    }
  },
  // 获取store数据调用的函数
  getRankingDataHandle(res) {
    this.setData({ rankingInfo: res})
  },
  // 处理歌曲点击 
  handleSongItemClick(event) {
    const index = event.currentTarget.dataset.index
    playerStore.setState("playListSongs",this.data.rankingInfo.tracks)
    playerStore.setState("playListIndex",index)
  }
})