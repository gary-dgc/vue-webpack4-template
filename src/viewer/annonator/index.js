import Rect from './helpers/Rect.js'

const AnnoInfo = {
  doc_id: '',
  anno_type: ''
}

export function setAnnoInfo (info = {}) {
  Object.keys(info).forEach((key) => {
    AnnoInfo[key] = info[key]
  })
}

export function getAnnoInfo (key) {
  if (key) {
    return AnnoInfo[key]
  } else {
    return AnnoInfo
  }
}

export default class Annonator {
  constructor ({ pageNumber, svg, viewport } = {}) {
    this.pageNumber = pageNumber
    this.svg = svg
    this.viewport = viewport
    this.helpers = {}
    this.initial()
  }

  initial () {
    this.helpers.rect = new Rect(this)
    const type = this.getAnnoType()
    if (['highlight', 'strikeout', 'area'].includes(type)) {
      this.handler = this.helpers.rect
    } else {
      this.handler = undefined
    }
  }

  getDocId () {
    return AnnoInfo.doc_id
  }

  getAnnoType () {
    return AnnoInfo.anno_type
  }

  /**
   * area, highlight, strikeout
   *
  **/
  enableRect (type) {
    AnnoInfo.anno_type = type
    this.initial()
  }

  enableEdit () {
    AnnoInfo.anno_type = 'edit'
    this.initial()
  }

  disable () {
    this.handler = undefined
  }

  handleMousedown (e) {
    if (this.handler) {
      this.handler.handleMousedown(e)
    }
  }

  handleMousemove (e) {
    if (this.handler) {
      this.handler.handleMousemove(e)
    }
  }

  handleMouseup (e) {
    if (this.handler) {
      this.handler.handleMouseup(e)
    }
  }

  handleKeyup (e) {
    if (this.handler) {
      this.handler.handleKeyup(e)
    }
  }
}
