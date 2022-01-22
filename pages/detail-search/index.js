// pages/detail-search/index.js
import { getSearchHot,getSearchSuggest } from '../../service/api_search'

Page({
  data: {
    hotKeyWords: [], // 热门搜索
    suggestList: [], // 建议搜索项
    textValue: "", // 搜索框输入的关键字
  },
  onLoad: function (options) {
    this.getSearchData()
  },
  // 请求获取热门搜索
  getSearchData() {
    getSearchHot().then(res => {
      this.setData({ hotKeyWords: res.result.hots })
    })
  },
  // 搜索框输入后的 事件处理
  searchTextChange(event) {
    const textValue = event.detail
    this.setData({ textValue })
    if(!textValue.length) {
      this.setData({ suggestList: [] })
      return
    }
    // 根据搜索关键字，获取相关搜索项
    getSearchSuggest(textValue).then(res => {
      this.setData({ suggestList: res.result.allMatch })
    })
  }
})