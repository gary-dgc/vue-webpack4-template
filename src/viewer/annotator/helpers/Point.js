import {
  BORDER_COLOR,
  scaleDown,
  scaleUp,
  setAttributes
} from './Utils'
/**
 *
 * trigger event: anno:focus; anno:blur
**/
export default class PointHandler {
  constructor (parent) {
    this.support = ['point'] // support command mode
    this.parent = parent
    this.getAnnoType = () => parent.type
    this.getDocId = parent.getDocId
    this.getConfig = parent.getConfig
  }

  /**
   * Reset the handler for active state
   *
   */
  reset () {
    if (this.input && this.input.nodeType) {
      this.input.removeEventListener('blur', this._blurRef)
      this.input.removeEventListener('keyup', this._keyupRef)
      this.input.parentNode.removeChild(this.input)
    }
    this.input = null
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
  handleMousemove (e) {}

  /**
   * Handle document.mouseup event
   *
   * @param {Event} e The DOM event to handle
   */
  handleMouseup (e) {
    const { size, color } = this.getConfig('text')
    const { svg } = this.parent
    const rect = svg.getBoundingClientRect()
    this.input = document.createElement('input')
    this.input.setAttribute('id', 'pdf-annotate-point-input')
    this.input.setAttribute('placeholder', 'Enter Comment')
    this.input.style.border = `1px dashed ${BORDER_COLOR}`
    this.input.style.borderRadius = '3px'
    this.input.style.position = 'absolute'
    this.input.style.top = `${e.clientY - rect.y}px`
    this.input.style.left = `${e.clientX - rect.x}px`
    this.input.style.fontSize = `${size}px`
    this.input.style.color = color

    this._blurRef = this._inputBlur.bind(this)
    this._keyupRef = this._handleKeyup.bind(this)

    this.input.addEventListener('blur', this._blurRef)
    this.input.addEventListener('keyup', this._keyupRef)

    svg.parentNode.appendChild(this.input)

    this.input.focus()
  }

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
   * Handle input.blur event
   */
  _inputBlur () {
    if (!this.input) return
    this.savePoint()
  }

  /**
   * Handle input.keyup event
   */
  _handleKeyup (e) {
    if (e.keyCode === 27) {
      this.reset()
    } else if (e.keyCode === 13) {
      this.savePoint()
    }
  }

  /**
    * Save a text annotation from input
    */
  savePoint () {
    const { input } = this

    if (input.value.trim().length > 0) {
      const clientX = parseInt(input.style.left, 10)
      const clientY = parseInt(input.style.top, 10)
      const { viewport: { scale } } = this.parent
      const { size } = this.getConfig('point')

      const annotation = Object.assign({
        type: 'point',
        content: input.value.trim()
      }, scaleDown(scale, {
        x: clientX,
        y: clientY,
        size: size
      })
      )

      this.parent.callback({ type: 'anno:add', data: annotation })
    }

    this.reset()
  }

  /**
   * Render annotation
   * <use xlink:href="#blast-icon" x="50" y="50" width="20px" height="20px" />
   * @param {Event} e The DOM event to handle
   */
  render (a) {
    const { viewport: { scale } } = this.parent
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')

    const pos = scaleUp(scale, {
      x: a.x,
      y: a.y,
      size: a.size
    })

    setAttributes(use, {
      x: pos.x,
      y: pos.y,
      width: `${pos.size}px`,
      height: `${pos.size}px`
    })
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#blast-icon')
    return use
  }
}
