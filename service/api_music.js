import enhanceReuqest from './index'
// 获取轮播图数据
export function getBanners() {
  return enhanceReuqest.get("/banner",{
    type: 2
  })
}
// 获取推荐歌单
export function getRanking(idx) {
  return enhanceReuqest.get("/top/list",{
    idx
  })
}
// 获取热门歌单
export function getSongMenu(cat="全部", limit=8, offset=0) {
  return enhanceReuqest.get("/top/playlist", {
    cat, // 华语，古风，欧美，流行，全部
    limit, // 默认50
    offset // 用于分页，(评论页数-1)*50
  })
}
// 歌单详情
export function getSongListDetail(id) {
  return enhanceReuqest.get("/playlist/detail/dynamic",{
    id
  })
}