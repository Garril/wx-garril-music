// pages/detail-search/index.js
import { getSearchHot, getSearchSuggest, getSearchResult } from '../../service/api_search'
import debounce from '../../utils/debounce'
import stringToNodes from '../../utils/string-to-nodes'

const debounceGetSearchSuggest = debounce(getSearchSuggest)

Page({
  data: {
    hotKeyWords: [], // 热门搜索
    suggestList: [], // 建议搜索项
    suggestNodes: [], // 建议搜索项，富文本，分节点，显示关键对应字段
    searchResList: [], // 搜索的结果-歌曲列表
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
      this.setData({ searchResList: [] })
      return
    }
    // 根据搜索关键字，获取相关搜索项
    debounceGetSearchSuggest(textValue).then(res => {
      // 拿到对应搜索项
      const suggestList = res.result.allMatch
      this.setData({ suggestList })
      // 转化为node节点
      const suggestKeyWords = suggestList.map(item => item.keyword)
      const suggestNodes = []
      for(let keyword of suggestKeyWords) {
        const nodes = stringToNodes(keyword,textValue)
        suggestNodes.push(nodes)
      }
      this.setData({ suggestNodes })
    })
  },
  // 监听搜索框的回车
  searchKeyUpEnter() {
    // 如果要加 历史搜索 的功能：
    // wx.set/getStorage，本地保存，或者保存到本地服务器
    // 保存的时候，注意判断下 搜索词的 重复性
    const textValue = this.data.textValue
    if(textValue == "") return
    getSearchResult(textValue).then(res => {
      // res有hasMore属性，可以做上拉加载更多功能，默认30条
      this.setData({ searchResList: res.result.songs })
    })
  },
  // 监听 搜索建议项的点击 和 热门搜索tag的点击
  // 要求 wxml 传过来的值，要拿得到（控制传递的属性名一致,这里都叫 keyword）
  handleItemClick(event) {
    // 获取 点击的列表项的 关键字
    const keyword = event.currentTarget.dataset.keyword
    // 设置到textValue中
    this.setData({ textValue: keyword })
    // 发送网络请求获取对应的列表
    getSearchResult(keyword).then(res => {
      // res有hasMore属性，可以做上拉加载更多功能，默认30条
      this.setData({ searchResList: res.result.songs })
    })
  },

})