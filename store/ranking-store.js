import { HYEventStore } from 'hy-event-store'
import { getRanking } from '../service/api_music'

const rankingStore = new HYEventStore({
  state: {
    newSongsRanking: {}, // 0：新歌榜
    hotRanking: {}, // 1: 热歌榜
    originRanking: {}, // 2：原创榜
    rushRanking: {} // 3：飙升榜
  },
  actions: {
    // 参数代表请求不同的榜单
    // 0：新歌榜 1: 热歌榜 2：原创榜 3：飙升榜
    getRankingDataAction(ctx) {
      getRanking(0).then(res => {
        res.playlist.signName = "newSongsRanking"
        ctx.newSongsRanking = res.playlist
      })
      getRanking(1).then(res => {
        res.playlist.signName = "hotRanking"
        ctx.hotRanking = res.playlist
      })
      getRanking(2).then(res => {
        res.playlist.signName = "originRanking"
        ctx.originRanking = res.playlist
      })
      getRanking(3).then(res => {
        res.playlist.signName= "rushRanking"
        ctx.rushRanking = res.playlist
      })
    }
  }
})
export {
  rankingStore
}