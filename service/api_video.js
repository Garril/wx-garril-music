import enhanceReuqest from './index'
// 请求视频数据--供选择
export function getTopMv(offset, limit = 10) {
  return enhanceReuqest.get("/top/mv",{
       offset,limit 
      })
}
/**
 * 请求视频数据--播放的视频数据
 * @param {number} id MV对应id
 */
export function getMvUrlById(id) {
  return enhanceReuqest.get("/mv/url",{
    id
  })
}
/**
 * 请求视频数据--播放的视频下方的详细数据
 * @param {number} mvid MV对应id
 */
export function getMvDetailById(mvid) {
  return enhanceReuqest.get("/mv/detail",{
    mvid
  })
}
/**
 * 请求视频数据--播放的视频下方的 其他推荐视频
 * @param {number} id MV对应id
 */
export function getMvRelatedVideo(id) {
  return enhanceReuqest.get("/related/allvideo",{
    id
  })
}