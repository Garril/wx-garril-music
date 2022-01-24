import enhanceReuqest from './index'
// 获取歌曲播放页信息
export function getSongDetail(ids) {
  return enhanceReuqest.get("/song/detail",{
    ids
  })
}