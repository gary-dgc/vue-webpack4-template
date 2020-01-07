import {
  BORDER_COLOR,
  scaleDown,
  scaleUp,
  normalizeColor,
  setAttributes
} from './Utils'
/**
 *
 * trigger event: anno:focus; anno:blur
**/
export default class TextHandler {
  constructor (parent) {
    this.support = ['text'] // support command mode
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
    this.input.setAttribute('id', 'pdf-annotate-text-input')
    this.input.setAttribute('placeholder', 'Enter text')
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
    this.saveText()
  }

  /**
   * Handle input.keyup event
   */
  _handleKeyup (e) {
    if (e.keyCode === 27) {
      this.reset()
    } else if (e.keyCode === 13) {
      this.saveText()
    }
  }

  /**
    * Save a text annotation from input
    */
  saveText () {
    const { input } = this
    if (this.input.value.trim().length > 0) {
      const clientX = parseInt(input.style.left, 10)
      const clientY = parseInt(input.style.top, 10)
      const { viewport: { scale } } = this.parent
      const { size, color } = this.getConfig('text')

      const annotation = Object.assign({
        type: 'text',
        size,
        color,
        content: input.value.trim()
      }, scaleDown(scale, {
        x: clientX,
        y: clientY,
        width: input.offsetWidth,
        height: input.offsetHeight
      })
      )

      this.parent.callback({ type: 'anno:add', data: annotation })
    }

    this.reset()
  }

  /**
   * Render annotation
   *
   * @param {Event} e The DOM event to handle
   */
  render (a) {
    const { viewport: { scale } } = this.parent
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')

    const pos = scaleUp(scale, {
      x: a.x,
      y: a.y + parseInt(a.size, 10),
      size: a.size
    })
    setAttributes(text, {
      x: pos.x,
      y: pos.y,
      fill: normalizeColor(a.color || '#000'),
      fontSize: pos.size
    })
    text.innerHTML = a.content

    return text
  }
}
