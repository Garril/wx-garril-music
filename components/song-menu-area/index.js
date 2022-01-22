// components/song-menu-area/index.js
const app = getApp()

Component({
  properties: {
    songMenu: {
      type: Array,
      value: []
    },
    title: {
      type: String,
      value: "默认标题"
    }
  },
  data: {
    screenWidth: app.globalData.screenWidth
  },
  methods: {
    handleMenuItemClick(event) {
      const listId = event.currentTarget.dataset.item.id;
      wx.navigateTo({
        url: `/pages/detail-songs/index?id=${listId}&type=songList`,
      })
    }
  }
})
