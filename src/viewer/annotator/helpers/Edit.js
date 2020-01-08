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
    this.support = ['edit'] // support command mode
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
    this.reset()
  }

  /**
   * Reset the handler for active state
   *
   */
  reset () {
    this.overlay = undefined
    this.current = {}
    this.range = {}
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) {
    if (this.current.uuid) {
      this.current.edit = true
      this.parent.callback({ type: 'anno:edit', data: this.current })
    }
  }

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) {
    if (this.current.edit) return
    this.detectAnno(e)
  }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()
    const rpos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    if (this.current.edit) {
      const rdiff = {
        x: rpos.x - this.range.x,
        y: rpos.y - this.range.y
      }
      if (rdiff.x < 0 || rdiff.x > this.range.width || rdiff.y < 0 || rdiff.y > this.range.height) {
        this.parent.callback({ type: 'anno:cancel', data: this.current })
        this.current.edit = false
      }
    }
  }

  /**
   * Handle document.keyup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleKeyup (e) {
    if (e.keyCode === 27) {
      this.parent.callback({ type: 'anno:cancel', data: this.current })
      this.current.edit = false
    }
  }

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
      this.range = data
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
        this.range = data
        this.parent.callback({ type: 'anno:focus', data })
      } else {
        this.parent.callback({ type: 'anno:blur', data: this.current })
      }
    })
  }

  /**
   * Check range in or out
   * @param {pos} {x, y}
   * return: true - found; false - unfound
  */
  _checkRange (annotation, rpos) {
    const { type, rectangles, x, y, size, width, height, lines } = annotation
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
    } else if (['area', 'text'].includes(type)) {
      const rdiff = {
        x: rpos.x - x,
        y: rpos.y - y
      }
      if (rdiff.x > 0 && rdiff.x < width && rdiff.y > 0 && rdiff.y < height) {
        found = true
      }
    } else if (['line'].includes(type)) {
      const [start, end] = lines

      const dist = Math.sqrt(Math.pow(Math.abs(start.x - end.x), 2) + Math.pow(Math.abs(start.y - end.y), 2))
      const dist1 = Math.sqrt(Math.pow(Math.abs(start.x - rpos.x), 2) + Math.pow(Math.abs(start.y - rpos.y), 2))
      const dist2 = Math.sqrt(Math.pow(Math.abs(end.x - rpos.x), 2) + Math.pow(Math.abs(end.y - rpos.y), 2))

      if (dist1 + dist2 - dist < 5) {
        found = true
      }
    } else if (['drawing'].includes(type)) {
      lines.some(l => {
        const dist = Math.sqrt(Math.pow((l.x - rpos.x), 2) + Math.pow((l.y - rpos.y), 2))
        if (dist < 4) {
          found = true
          return true
        }
      })
    } else if (['point'].includes(type)) {
      const rdiff = {
        x: rpos.x - x,
        y: rpos.y - y
      }
      if (rdiff.x > 0 && rdiff.x < size && rdiff.y > 0 && rdiff.y < size) {
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
    const { type, rectangles, x, y, width, height, size, lines } = annotation
    let rect = { x: 0, y: 0, width: 0, height: 0 }
    if (['highlight', 'strikeout'].includes(type)) {
      rectangles.forEach(r => {
        // move horizontal pos to left
        if (rect.x === 0 || rect.x > r.x) {
          rect.width += rect.x > r.x ? rect.x - r.x : 0
          rect.x = r.x
        }
        // move vertical pos to top
        if (rect.y === 0 || rect.y > r.y) {
          rect.height += rect.y > r.y ? rect.y - r.y : 0
          rect.y = r.y
        }
        // extend width
        if (rect.width === 0) {
          rect.width = r.width
        } else if (rect.x + rect.width < r.x + r.width) {
          rect.width = r.x + r.width - rect.x
        }
        // extend height
        if (rect.height === 0) {
          rect.height = r.height
        } else if (rect.y + rect.height < r.y + r.height) {
          rect.height = r.y + r.height - rect.y
        }
      })
    } else if (['area', 'text'].includes(type)) {
      rect.x = x
      rect.y = y
      rect.width = width
      rect.height = height
    } else if (['line'].includes(type)) {
      const [start, end] = lines
      rect.x = Math.min(start.x, end.x)
      rect.y = Math.min(start.y, end.y)
      rect.width = Math.abs(start.x - end.x)
      rect.height = Math.abs(start.y - end.y)
    } else if (['drawing'].includes(type)) {
      const [first, ...rest] = lines
      const maxPos = Object.assign({}, first)
      rect.x = first.x
      rect.y = first.y

      rest.forEach(l => {
        rect.x = Math.min(rect.x, l.x)
        rect.y = Math.min(rect.y, l.y)
        maxPos.x = Math.max(maxPos.x, l.x)
        maxPos.y = Math.max(maxPos.y, l.y)
      })
      rect.width = maxPos.x - rect.x
      rect.height = maxPos.y - rect.y
    } else if (['point'].includes(type)) {
      rect.x = x
      rect.y = y
      rect.width = size
      rect.height = size
    }

    const { min } = this.getConfig('size')
    if (rect.width < min) {
      rect.x -= (min - rect.width) / 2
      rect.width = min
    }
    if (rect.height < min) {
      rect.y -= (min - rect.height) / 2
      rect.height = min
    }
    rect = scaleUp(scale, rect)
    rect.uuid = annotation.uuid
    rect.type = annotation.type

    return rect
  }
}
