// components/song-item-v2/index.js
Component({

  properties: {
    item: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
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
