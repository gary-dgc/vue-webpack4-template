export default class RectHandler {
  constructor (parent) {
    this.overlay = undefined
    this.originX = 0
    this.originY = 0
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
  }
}
