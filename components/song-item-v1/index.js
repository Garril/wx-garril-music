// components/song-item-v1/index.js
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
      wx.navigateTo({
        url: '/pages/music-player/index?id='+ id,
      })
    }
  }
})
