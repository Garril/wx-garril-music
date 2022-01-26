// components/song-item-v1/index.js
import { playerStore } from '../../store/index'

Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {

  },
  methods: {
    handleSongClick() {
      const id = this.properties.item.id
      // 页面跳转
      wx.navigateTo({
        url: '/pages/music-player/index?id='+ id,
      })
      // 让store-action去发送请求，将歌曲信息保存到store内
      playerStore.dispatch("requestPlayMusicById",{ id })
    }
  }
})
