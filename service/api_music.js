import enhanceReuqest from './index'

export function getBanners() {
  return enhanceReuqest.get("/banner",{
    type: 2
  })
}