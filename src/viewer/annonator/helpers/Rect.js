
import {
  BORDER_COLOR,
  scaleDown,
  getSelectionRects
} from './utils'

export default class RectHandler {
  constructor (parent) {
    this.overlay = undefined
    this.originX = 0
    this.originY = 0
    this.parent = parent
    this.getAnnoType = parent.getAnnoType
    this.getDocId = parent.getDocId
  }

  /**
 * Handle document.mousedown event
 *
 * @param {Event} e The DOM event to handle
 */
  handleMousedown (e) {
    if (this.getAnnoType() !== 'area') {
      return
    }
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()
    this.originY = e.clientY
    this.originX = e.clientX

    this.overlay = document.createElement('div')
    this.overlay.style.position = 'absolute'
    this.overlay.style.top = `${this.originY - rect.top}px`
    this.overlay.style.left = `${this.originX - rect.left}px`
    this.overlay.style.border = `3px solid ${BORDER_COLOR}`
    this.overlay.style.borderRadius = '3px'
    svg.parentNode.appendChild(this.overlay)
  }

  /**
 * Handle document.mousemove event
 *
 * @param {Event} e The DOM event to handle
 */
  handleMousemove (e) {
    if (['highlight', 'strikeout'].includes(this.getAnnoType())) {
      return
    }
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()

    if (this.originX + (e.clientX - this.originX) < rect.right) {
      this.overlay.style.width = `${e.clientX - this.originX}px`
    }

    if (this.originY + (e.clientY - this.originY) < rect.bottom) {
      this.overlay.style.height = `${e.clientY - this.originY}px`
    }
  }

  /**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
  handleMouseup (e) {
    let rects
    const type = this.getAnnoType()
    if (['highlight', 'strikeout'].includes(type) && (rects = getSelectionRects())) {
      this.saveRect(type, [...rects].map((r) => {
        return {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        }
      }))
    } else if (type === 'area' && this.overlay) {
      const rect = this.svg.getBoundingClientRect()
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
      const selection = window.getSelection()
      selection.removeAllRanges()
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay)
        this.overlay = null
      }
    }
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

    const boundingRect = this.svg.getBoundingClientRect()
    const { svg } = this.parent
    if (!color) {
      if (type === 'highlight') {
        color = 'FFFF00'
      } else if (type === 'strikeout') {
        color = 'FF0000'
      }
    }

    // Initialize the annotation
    annotation = {
      type,
      color,
      rectangles: [...rects].map((r) => {
        let offset = 0

        if (type === 'strikeout') {
          offset = r.height / 2
        }

        return scaleDown(svg, {
          y: (r.top + offset) - boundingRect.top,
          x: r.left - boundingRect.left,
          width: r.width,
          height: r.height
        })
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

    const { pageNumber } = this.parent
    const documentId = this.getDocId()
    // Add the annotation
    console.log(`docId=${documentId} / pagenum=${pageNumber}`)
    console.log(annotation)
  }
}
