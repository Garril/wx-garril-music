// 解析歌词
const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
export function parseLyric(lyricString) {
  const lyricArr = []
  const lyricStrings = lyricString.split("\n")
  for(const lineString of lyricStrings) {
    // [00:58:63] 他们说xxx   ----- 对应 min，s，ms 如果要做字符串截取，很麻烦，用正则
    const timeResult = timeRegExp.exec(lineString) // timeResult每次，为一个数组，4个值，分别[00:58:63]、00、58、63
    if(!timeResult) continue // 如果当前歌词没有标时间，跳过
    // 获取时间
    const minute = timeResult[1] * 60 * 1000 // 隐式转化
    const second = timeResult[2] * 1000
    const millt = timeResult[3]
    const millsecond = millt.length==2 ? millt * 10 : millt * 1
    const mulTime = minute + second + millsecond
    // 获取歌词文本
    const lyricText = lineString.replace(timeRegExp,"") // 或者不传正则，直接传 timeResult[0]
    const lyricInfo = { 
      time: mulTime,
      text: lyricText
    }
    lyricArr.push(lyricInfo)
  }
  return lyricArr
}