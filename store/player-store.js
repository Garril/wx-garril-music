import { HYEventStore } from 'hy-event-store'

const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
  state: {

  },
  actions: {

  }
})
export {
  audioContext,
  playerStore
}