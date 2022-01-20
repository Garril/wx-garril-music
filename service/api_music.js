import enhanceReuqest from './index'
// 获取轮播图数据
export function getBanners() {
  return enhanceReuqest.get("/banner",{
    type: 2
  })
}
// 获取榜单数据
export function getRanking(idx) {
  return enhanceReuqest.get("/top/list",{
    idx
  })
}
