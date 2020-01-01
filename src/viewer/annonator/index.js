import Rect from './helpers/Rect.js'

const DocInfo = {}

export function setDocInfo (info = {}) {
  Object.keys(info).forEach((key) => {
    DocInfo[key] = info[key]
  })
}

export function getDocInfo (key) {
  if (key) {
    return DocInfo[key]
  } else {
    return DocInfo
  }
}

export default class Annonator {
  constructor ({ pageNumber, svg, viewport } = {}) {
    this.pageNumber = pageNumber
    this.svg = svg
    this.viewport = viewport
    this.helpers = {}
    this.initial()
    this.handler = undefined
  }

  initial () {
    this.helpers.rect = new Rect(this)
  }

  getDocId () {
    return DocInfo.doc_id
  }

  /**
   * area, highlight, strikeout
   *
  **/
  enableRect (type) {
    this.handler = this.helpers.rect
    this.handler.setType(type)
  }

  disable () {
    this.handler = undefined
  }

  handleMousedown (e) {
    if (this.handler) {
      this.handler.handleMousedown()
    }
  }

  handleMousemove (e) {
    if (this.handler) {
      this.handler.handleMousemove()
    }
  }

  handleMouseup (e) {
    if (this.handler) {
      this.handler.handleMouseup()
    }
  }

  handleKeyup (e) {
    if (this.handler) {
      this.handler.handleKeyup()
    }
  }
}
