// baseui/nav-bar/index.js
const globalData = getApp().globalData

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    title: {
      type: String,
      value: "默认标题"
    }
  },
  data: {
    statusBarHeight: globalData.statusBarHeight,
    navBarHeight: globalData.navBarHeight
  },
  // lifetimes:{  ready() {...}, } 组件的生命周期都写这里
  methods: {
    handleLeftClick: function() {
      this.triggerEvent('click')
    }
  }
})
