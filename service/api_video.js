import enhanceReuqest from './index'

export function getTopMv(offset, limit = 10) {
  return enhanceReuqest.get(
    "/top/mv",
    {
      offset,
      limit
    }
  )
}