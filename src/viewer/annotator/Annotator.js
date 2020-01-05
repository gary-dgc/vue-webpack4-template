import EventEmitter from 'events'
import Rect from './helpers/Rect'
import Edit from './helpers/Edit'
import adapter from './adapter'

import { setAnnoInfo, getAnnoInfo } from './Config'

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

/**
 * The annotators object holder
**/
const Annotators = {}
export function getAnnotator ({ pageNumber, svg, viewport, callback } = {}) {
  let anno = Annotators[pageNumber]
  if (!pageNumber) return
  if (!anno) {
    anno = new Annotator({ pageNumber, svg, viewport, callback })
    Annotators[pageNumber] = anno
  }
  return anno
}

/**
 * Enable annotator action type
**/
export function enableAnno ({ type } = {}) {
  setAnnoInfo({ anno_type: type })
  fireAnnoEvent('anno:event', { type })
}

/**
 * Config annotator with setting
**/
export function configAnno ({ setting, data } = {}) {
  const config = {}
  config[setting] = data
  setAnnoInfo(config)
  fireAnnoEvent('anno:event', { setting, data })
}

/**
 * Annotator class, it defines page-level operation
 *
**/
class Annotator {
  constructor ({ pageNumber, svg, viewport, callback } = {}) {
    this.pageNumber = pageNumber
    this.svg = svg
    this.viewport = viewport
    this._callback = callback
    this.type = getAnnoInfo('anno_type')
    this.helpers = {}
    this.helpers.rect = new Rect(this)
    this.helpers.edit = new Edit(this)
    this.reset()
    this.hook()
    this.render()
  }

  reset () {
    if (['highlight', 'strikeout', 'area'].includes(this.type)) {
      this.handler = this.helpers.rect
    } else if (['edit'].includes(this.type)) {
      this.handler = this.helpers.edit
    } else {
      this.handler = undefined
    }
  }

  /**
   * Get document id
  **/
  getDocId () {
    return getAnnoInfo('doc_id')
  }

  /**
   * Get document id
  **/
  getConfig (setting) {
    return getAnnoInfo(setting)
  }

  /**
   * area, highlight, strikeout
   *
  **/
  enable ({ type } = {}) {
    if (!type) return
    this.type = type
    this.reset()
  }

  /**
   * Disable handler
   **/
  disable () {
    this.handler = undefined
  }

  /**
   * Handle mouse-down
   **/
  handleMousedown () {
    if (this.handler) {
      this.handler.handleMousedown(...arguments)
    }
  }

  /**
   * Handle mouse-move
   **/
  handleMousemove () {
    if (this.handler) {
      this.handler.handleMousemove(...arguments)
    }
  }

  /**
   * Handle mouse-up
   **/
  handleMouseup () {
    if (this.handler) {
      this.handler.handleMouseup(...arguments)
    }
  }

  /**
   * Handle key-up
   **/
  handleMouseleave () {
    if (this.handler) {
      this.handler.handleMouseleave(...arguments)
    }
  }

  /**
   * Handle key-up
   **/
  handleKeyup () {
    if (this.handler) {
      this.handler.handleKeyup(...arguments)
    }
  }

  render (annotation) {
    if (annotation) {
      this.renderAnno(annotation)
    } else {
      adapter.getAnnotations(this.getDocId(), this.pageNumber)
        .then(data => {
          const { annotations } = data
          annotations.forEach(a => {
            this.renderAnno(a)
          })
        })
    }
  }

  /**
   * Render the annotation
   * @param {Annotation} annotation data
  */
  renderAnno (annotation) {
    let child
    switch (annotation.type) {
      case 'area':
      case 'highlight':
      case 'strikeout':
        child = this.helpers.rect.render(annotation)
        break
    }

    // If no type was provided for an annotation it will result in node being null.
    // Skip appending/transforming if node doesn't exist.
    if (child) {
      // Set attributes
      child.setAttribute('data-pdf-annotate-id', annotation.uuid)
      child.setAttribute('data-pdf-annotate-type', annotation.type)
      child.setAttribute('data-pdf-page', this.pageNumber)
      child.setAttribute('aria-hidden', true)

      this.svg.appendChild(child)
    }

    return child
  }

  /**
   * Callback the data
   *
  **/
  callback () {
    const { type, data } = arguments[0]
    if (['anno:add'].includes(type)) {
      adapter.addAnnotation(this.getDocId(), this.pageNumber, data)
    }
    // let's forward the data to ui component
    this._callback(...arguments)
  }

  /**
   * Hook the annotator
   **/
  hook () {
    const _eventRef = function () {
      const { type } = arguments[0] || {}
      if (['highlight', 'strikeout', 'area', 'edit'].includes(type)) {
        this.enable({ type })
      }
      this.callback(...arguments)
    }.bind(this)

    addAnnoEventListener('anno:event', _eventRef)
    this._eventRef = _eventRef
  }

  /**
   * Release the annotator
   **/
  release () {
    const { _eventRef } = this
    removeAnnoEventListener('anno:event', _eventRef)
    delete Annotators[this.pageNumber]
  }
}
