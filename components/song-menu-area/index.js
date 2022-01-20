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

  }
})
