import EventEmitter from 'events'
import Rect from './helpers/Rect.js'

const EE = new EventEmitter()

export function fireAnnoEvent () {
  EE.emit(...arguments)
}
export function addAnnoEventListener () {
  EE.on(...arguments)
}
export function removeAnnoEventListener () {
  EE.removeListener(...arguments)
}

const AnnoInfo = {
  doc_id: '',
  anno_type: 'edit'
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

const Annotators = {}
export function getAnnonator ({ pageNumber, svg, viewport } = {}) {
  let anno = Annotators[pageNumber]
  if (!pageNumber) return
  if (!anno) {
    anno = new Annonator({ pageNumber, svg, viewport })
    Annotators[pageNumber] = anno
  }
  return anno
}

export function enableAnno (type) {
  AnnoInfo.anno_type = type
  fireAnnoEvent('anno:enable', type)
}

class Annonator {
  constructor ({ pageNumber, svg, viewport, callback } = {}) {
    this.pageNumber = pageNumber
    this.svg = svg
    this.viewport = viewport
    this.callback = callback
    this.helpers = {}
    this.reset()
    this.hook()
  }

  reset () {
    this.helpers.rect = new Rect(this)
    if (['highlight', 'strikeout', 'area'].includes(this.type)) {
      this.handler = this.helpers.rect
    } else {
      this.handler = undefined
    }
  }

  getDocId () {
    return AnnoInfo.doc_id
  }

  /**
   * area, highlight, strikeout
   *
  **/
  enable (type) {
    this.type = type
    this.reset()
  }

  disable () {
    this.handler = undefined
  }

  handleMousedown () {
    if (this.handler) {
      this.handler.handleMousedown(...arguments)
    }
  }

  handleMousemove () {
    if (this.handler) {
      this.handler.handleMousemove(...arguments)
    }
  }

  handleMouseup () {
    if (this.handler) {
      this.handler.handleMouseup(...arguments)
    }
  }

  handleKeyup () {
    if (this.handler) {
      this.handler.handleKeyup(...arguments)
    }
  }

  hook () {
    const _enableRef = function () {
      this.enable(...arguments)
      this.callback(...arguments)
    }.bind(this)

    addAnnoEventListener('anno:enable', _enableRef)
    this._enableRef = _enableRef
  }

  release () {
    const { _enableRef } = this
    removeAnnoEventListener('anno:enable', _enableRef)
    delete Annotators[this.pageNumber]
  }
}

export default {
  setAnnoInfo,
  getAnnoInfo,
  getAnnonator,
  enableAnno,
  fireAnnoEvent,
  addAnnoEventListener,
  removeAnnoEventListener
}
