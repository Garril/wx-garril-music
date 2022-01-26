import enhanceReuqest from './index'
// 获取歌曲播放页信息
export function getSongDetail(ids) {
  return enhanceReuqest.get("/song/detail",{
    ids
  })
}
// 获取歌词
export function getSongLyric(id) {
  return enhanceReuqest.get("/lyric",{
    id
  })
}