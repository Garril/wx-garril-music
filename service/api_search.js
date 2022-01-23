import enhanceRequest from './index'
// 热门搜索
export function getSearchHot() {
  return enhanceRequest.get("/search/hot")
}
// 搜索建议
export function getSearchSuggest(keywords) {
  return enhanceRequest.get("/search/suggest",{
    keywords, // 输入文本
    type: "mobile" // 移动端
  })
}
// 搜索结果
export function getSearchResult(keywords) {
  return enhanceRequest.get("/search",{
    keywords
  })
}