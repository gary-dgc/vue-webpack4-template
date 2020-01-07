
import {
  BORDER_COLOR,
  setAttributes,
  normalizeColor,
  scaleDown,
  scaleUp,
  uuid
} from './Utils'
/**
 *
 * trigger event: anno:add
**/
export default class AreaHandler {
  constructor (parent) {
    this.support = ['area'] // support command mode

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
    this.originX = 0
    this.originY = 0
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) {
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()
    this.originY = e.clientY
    this.originX = e.clientX

    this.overlay = document.createElement('div')
    this.overlay.style.position = 'absolute'
    this.overlay.style.top = `${Math.ceil(this.originY - rect.top)}px`
    this.overlay.style.left = `${Math.ceil(this.originX - rect.left)}px`
    this.overlay.style.border = `2px solid ${BORDER_COLOR}`
    this.overlay.style.borderRadius = '2px'

    svg.parentNode.appendChild(this.overlay)
  }

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) {
    if (!this.overlay) return
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()

    const diff = { x: e.clientX - this.originX, y: e.clientY - this.originY }

    if (diff.x >= 0 && this.originX + diff.x < rect.right) {
      // bottom + right moving
      this.overlay.style.width = `${diff.x}px`
    } else if (diff.x < 0 && this.originX + diff.x > rect.left) {
      // top + left moving
      this.overlay.style.left = `${Math.ceil(e.clientX - rect.left)}px`
      this.overlay.style.width = `${Math.abs(diff.x)}px`
    }
    if (diff.y >= 0 && this.originY + diff.y < rect.bottom) {
      // bottom + right moving
      this.overlay.style.height = `${diff.y}px`
    } else if (diff.y < 0 && this.originY + diff.y > rect.top) {
      // top + left moving
      this.overlay.style.top = `${Math.ceil(e.clientY - rect.top)}px`
      this.overlay.style.height = `${-1 * diff.y}px`
    }
  }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    const type = this.getAnnoType()
    if (type === 'area' && this.overlay) {
      const { svg } = this.parent
      const rect = svg.getBoundingClientRect()
      this.saveRect(type, [{
        top: parseInt(this.overlay.style.top, 10) + rect.top,
        left: parseInt(this.overlay.style.left, 10) + rect.left,
        width: parseInt(this.overlay.style.width, 10),
        height: parseInt(this.overlay.style.height, 10)
      }])

      this.overlay.parentNode.removeChild(this.overlay)
      this.overlay = null
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
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay)
        this.overlay = null
      }
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

    // Initialize the annotation
    annotation = {
      uuid: uuid(),
      type,
      color,
      rectangles: [...rects].map((r) => {
        const rect = scaleDown(scale, {
          y: r.top - boundingRect.top,
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

    // Special treatment for area as it only supports a single rect
    if (type === 'area') {
      const rect = annotation.rectangles[0]
      delete annotation.rectangles
      annotation.x = rect.x
      annotation.y = rect.y
      annotation.width = rect.width
      annotation.height = rect.height
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
    if (a.type === 'area') {
      offset.width = 1
      offset.height = 1
      const rect = this._createRect(a, offset)
      setAttributes(rect, {
        stroke: normalizeColor(a.color || '#f00'),
        strokeWidth: 2,
        fill: 'none'
      })

      return rect
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
