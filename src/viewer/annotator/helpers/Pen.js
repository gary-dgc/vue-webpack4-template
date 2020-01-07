
import {
  scaleDown,
  scaleUp,
  setAttributes,
  normalizeColor
} from './Utils'
/**
 *
 * trigger event: anno:focus; anno:blur
**/
export default class PenHandler {
  constructor (parent) {
    this.support = ['drawing'] // support command mode
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
    this.lines = []
    if (this.path && this.path.nodeType) {
      const { svg } = this.parent
      svg.removeChild(this.path)
    }
    this.path = null
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) {
    this.path = {} // use {} to indicate start
    this.lines = []
  }

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) {
    if (this.path) {
      this.savePoint(e.clientX, e.clientY)
    }
  }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    if (this.lines.length > 1) {
      const { color, size } = this.getConfig('pen')
      const anno = {
        type: 'drawing',
        color,
        width: size,
        lines: this.lines
      }
      // Add the annotation
      this.parent.callback({ type: 'anno:add', data: anno })
    }
    this.reset()
  }

  /**
   * Handle document.keyup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleKeyup (e) {
    // Cancel rect if Esc is pressed
    if (e.keyCode === 27) {
      this.reset()
    }
  }

  /**
   * Save a point to the line being drawn.
   *
   * @param {Number} x The x coordinate of the point
   * @param {Number} y The y coordinate of the point
   */
  savePoint (x, y) {
    const { svg, viewport: { scale } } = this.parent
    if (!svg) {
      return
    }

    const rect = svg.getBoundingClientRect()
    const point = scaleDown(scale, {
      x: x - rect.left,
      y: y - rect.top
    })

    this.lines.push(point)

    if (this.lines.length <= 1) {
      return
    }

    const { color, size } = this.getConfig('pen')
    const anno = {
      type: 'drawing',
      color,
      width: size,
      lines: this.lines
    }

    if (this.path.nodeType) {
      // remove old dom element
      svg.removeChild(this.path)
    }

    // render new path graph
    this.path = this.render(anno)
    svg.appendChild(this.path)
  }

  /**
    * Render a drawing annotation
    *
    * @param {Annotation} a the annotation
  */
  render (a) {
    const d = []
    const { viewport: { scale } } = this.parent
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    for (let i = 0, l = a.lines.length; i < l; i++) {
      const p1 = scaleUp(scale, a.lines[i])
      let p2 = a.lines[i + 1]
      if (p2) {
        p2 = scaleUp(scale, p2)
        d.push(`M${p1.x} ${p1.y} ${p2.x} ${p2.y}`)
      }
    }

    setAttributes(path, {
      d: `${d.join(' ')}Z`,
      stroke: normalizeColor(a.color || '#000'),
      strokeWidth: a.width || 1,
      fill: 'none'
    })

    return path
  }
}
