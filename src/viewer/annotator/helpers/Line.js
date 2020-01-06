import {
  scaleDown,
  scaleUp,
  normalizeColor,
  setAttributes
} from './Utils'
/**
 *
 * trigger event: anno:focus; anno:blur
**/
export default class LineHandler {
  constructor (parent) {
    this.support = ['line'] // support command mode
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
    this.path = null
    this.origin = {}
    this.end = {}
  }

  /**
   * Handle document.mousedown event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousedown (e) {
    const { svg, viewport: { scale } } = this.parent
    const rect = svg.getBoundingClientRect()
    const point = scaleDown(scale, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    this.origin = point
    this.end = Object.assign({}, point)
    this.path = {}
  }

  /**
   * Handle document.mousemove event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMousemove (e) {
    if (this.path) {
      this.saveLine(e.clientX, e.clientY)
    }
  }

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    if (Math.abs(this.origin.x - this.end.x) > 14 && Math.abs(this.origin.y - this.end.y) > 14) {
      const { color, size } = this.getConfig('pen')
      const anno = {
        type: 'line',
        color,
        width: size,
        points: [this.origin, this.end]
      }
      // Add the annotation
      this.parent.callback({ type: 'anno:add', data: anno })
    }
    this._reset()
  }

  /**
   * Handle document.keyup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleKeyup (e) {
    // Cancel rect if Esc is pressed
    if (e.keyCode === 27) {
      this._reset()
    }
  }

  /**
   * Reset the operation state
  */
  _reset () {
    this.lines = []
    if (this.path) {
      const { svg } = this.parent
      svg.removeChild(this.path)
    }
    this.path = null
    this.origin = {}
    this.end = {}
  }

  /**
   * Handle mouse leave event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseleave (e) {}

  /**
   * Save a point to the line being drawn.
   *
   * @param {Number} x The x coordinate of the point
   * @param {Number} y The y coordinate of the point
   */
  saveLine (x, y) {
    const { svg, viewport: { scale } } = this.parent
    if (!svg) {
      return
    }

    const rect = svg.getBoundingClientRect()
    const point = scaleDown(scale, {
      x: x - rect.left,
      y: y - rect.top
    })
    this.end = point
    const { color, size } = this.getConfig('pen')
    const anno = {
      type: 'line',
      color,
      width: size,
      points: [this.origin, point]
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
   * Render annotation
   *
   * @param {Event} e The DOM event to handle
   */
  render (a) {
    const { viewport: { scale } } = this.parent
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    let [start, end] = a.points
    start = scaleUp(scale, start)
    end = scaleUp(scale, end)
    const d = `M ${start.x} ${start.y} ${end.x} ${end.y}`
    setAttributes(path, {
      d,
      stroke: normalizeColor(a.color || '#000'),
      strokeWidth: a.width || 1,
      markerEnd: 'url(#red-arrowhead)',
      fill: 'none'
    })

    return path
  }
}
