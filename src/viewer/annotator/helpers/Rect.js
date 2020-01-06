
import {
  setAttributes,
  getSelectionRects,
  normalizeColor,
  scaleDown,
  scaleUp,
  uuid
} from './Utils'
/**
 *
 * trigger event: anno:add
**/
export default class RectHandler {
  constructor (parent) {
    this.support = ['highlight', 'strikeout'] // support command mode
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) { }

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) { }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    let rects
    const type = this.getAnnoType()
    if (['highlight', 'strikeout'].includes(type) && (rects = getSelectionRects(true))) {
      this.saveRect(type, [...rects].map((r) => {
        return {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        }
      }))
    }
  }

  /**
   * Handle document.keyup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleKeyup (e) {
  // Cancel rect if Esc is pressed
    if (e.keyCode === 27) {
      const selection = window.getSelection()
      selection.removeAllRanges()
    }
  }

  /**
   * Handle mouse leave event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseleave (e) {
    this.handleMouseup(e)
  }

  /**
   * Save a rect annotation
   *
   * @param {String} type The type of rect (area, highlight, strikeout)
   * @param {Array} rects The rects to use for annotation
   * @param {String} color The color of the rects
   */
  saveRect (type, rects, color) {
    let annotation = null
    const { svg, viewport: { scale } } = this.parent
    const boundingRect = svg.getBoundingClientRect()
    if (!color) {
      if (type === 'highlight') {
        color = 'FFFF00'
      } else if (type === 'strikeout') {
        color = 'FF0000'
      }
    }

    // Initialize the annotation
    annotation = {
      uuid: uuid(),
      type,
      color,
      rectangles: [...rects].map((r) => {
        let offset = 0

        if (type === 'strikeout') {
          offset = r.height / 2
        }

        const rect = scaleDown(scale, {
          y: (r.top + offset) - boundingRect.top,
          x: r.left - boundingRect.left,
          width: r.width,
          height: r.height
        })
        return rect
      }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)
    }

    // Short circuit if no rectangles exist
    if (annotation.rectangles.length === 0) {
      return
    }

    // Add the annotation
    this.parent.callback({ type: 'anno:add', data: annotation })
  }

  /**
   * Render annotation
   *
   * @param {Event} e The DOM event to handle
   */
  render (a) {
    const offset = { x: 1, y: 1 }
    if (a.type === 'highlight') {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      setAttributes(group, {
        fill: normalizeColor(a.color || '#ff0'),
        fillOpacity: 0.3
      })

      a.rectangles.forEach((r) => {
        group.appendChild(this._createRect(r, offset))
      })

      return group
    } else if (a.type === 'strikeout') {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const { viewport: { scale } } = this.parent
      setAttributes(group, {
        stroke: normalizeColor(a.color || '#f00'),
        strokeWidth: 2
      })

      a.rectangles.forEach((r) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        const attrs = scaleUp(scale, {
          x1: r.x,
          y1: r.y + offset.y,
          x2: (r.x + r.width),
          y2: r.y + offset.y
        })
        setAttributes(line, attrs)

        group.appendChild(line)
      })

      return group
    }
  }

  /**
   * create rect dom el
   *
  */
  _createRect (r, offset) {
    const { viewport: { scale } } = this.parent
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    let attrs = {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height
    }

    if (offset) {
      Object.keys(attrs).forEach((key) => {
        attrs[key] = attrs[key] + (offset[key] ? offset[key] : 0)
      })
    }
    attrs = scaleUp(scale, attrs)
    setAttributes(rect, attrs)
    return rect
  }
}
