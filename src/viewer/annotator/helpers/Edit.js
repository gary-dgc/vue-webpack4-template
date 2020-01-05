import adapter from '../adapter'
import {
  scaleDown,
  scaleUp
} from './Utils'
/**
 *
 * trigger event: anno:focus; anno:blur
**/
export default class EditHandler {
  constructor (parent) {
    this.overlay = undefined
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
    this.current = {}
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) {}

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) {
    this.detectAnno(e)
  }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {}

  /**
   * Handle document.keyup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleKeyup (e) {}

  /**
   * Handle mouse leave event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseleave (e) {}

  /**
   * Detect the current annotation
  **/
  detectAnno (e) {
    const { pageNumber } = this.parent
    const { svg, viewport: { scale } } = this.parent
    const rect = svg.getBoundingClientRect()
    const rpos = scaleDown(scale, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    if (this.current.uuid && this._checkRange(this.current, rpos)) {
      // found still in current anno
      const data = this.calcAnnoRange(this.current)
      this.parent.callback({ type: 'anno:focus', data })
      return
    } else {
      this.current = {} // reset current
    }
    adapter.getAnnotations(this.getDocId(), pageNumber).then(data => {
      const { annotations } = data

      annotations.some(annotation => {
        const found = this._checkRange(annotation, rpos)
        if (found) {
          this.current = annotation
        }

        return found
      })
      if (this.current.uuid) {
        const data = this.calcAnnoRange(this.current)
        this.parent.callback({ type: 'anno:focus', data })
      } else {
        this.parent.callback({ type: 'anno:blur', data: this.current })
      }
    })
  }

  /**
   * Check range in or out
   * return: true - found; false - unfound
  */
  _checkRange (annotation, rpos) {
    const { type, rectangles, x, y, width, height } = annotation
    let found = false
    if (['highlight', 'strikeout'].includes(type)) {
      rectangles.some(r => {
        const rdiff = {
          x: rpos.x - r.x,
          y: rpos.y - r.y
        }
        if (rdiff.x > 0 && rdiff.x < r.width && rdiff.y > 0 && rdiff.y < r.height) {
          found = true
          return true
        }
      })
    } else if (['area'].includes(type)) {
      const rdiff = {
        x: rpos.x - x,
        y: rpos.y - y
      }
      if (rdiff.x > 0 && rdiff.x < width && rdiff.y > 0 && rdiff.y < height) {
        found = true
      }
    }
    return found
  }

  /**
   * Calculate annotation ui range
   *
  **/
  calcAnnoRange (annotation) {
    const { viewport: { scale } } = this.parent
    const { type, rectangles, x, y, width, height } = annotation
    let rect = { x: 0, y: 0, width: 0, height: 0 }
    if (['highlight', 'strikeout'].includes(type)) {
      rectangles.forEach(r => {
        if (rect.x === 0 || rect.x > r.x) {
          rect.x = r.x
          rect.width += (rect.x - r.x) > 0 ? rect.x > r.x : 0
        }

        if (rect.y === 0 || rect.y > r.y) {
          rect.y = r.y
          rect.height += (rect.y - r.y) > 0 ? rect.y - r.y : 0
        }

        if (rect.width === 0) {
          rect.width = r.width
        } else if (rect.x + rect.width > r.x + r.width) {
          rect.width = r.x + r.width - rect.x
        }

        if (rect.height === 0) {
          rect.height = r.height
        } else if (rect.y + rect.height > r.y + r.height) {
          rect.height = r.y + r.height - rect.y
        }
      })
    } else if (['area'].includes(type)) {
      rect.x = x
      rect.y = y
      rect.width = width
      rect.height = height
    }

    rect = scaleUp(scale, rect)
    rect.uuid = annotation.uuid
    rect.type = annotation.type

    return rect
  }
}
