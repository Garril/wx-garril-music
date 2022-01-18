// pages/detail-video/index.js
import { getMvUrlById,getMvDetailById,getMvRelatedVideo } from '../../service/api_video'
Page({
  data: {
    mvURL: {},
    mvDetail: {},
    relatedVideos: []
  },
  onLoad: function (options) {
    const id = options.id
    this.getPageDate(id)
  },
  getPageDate(id) {
    // 拿视频url
    getMvUrlById(id).then(res => {
      this.setData( {mvURL: res.data })
    })
    // 拿视频详细信息
    getMvDetailById(id).then(res => {
      this.setData( {mvDetail: res.data })
    })
    // 拿相关视频信息
    getMvRelatedVideo(id).then(res => {
      this.setData( {relatedVideos: res.data })
    })
  }
})