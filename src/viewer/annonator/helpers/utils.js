// import createStyleSheet from 'create-stylesheet'

export const BORDER_COLOR = '#00BFFF'

/**
 * Find an Element that represents an annotation at a given point
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 * @return {Element} The annotation element or null if one can't be found
 */
export function findAnnotationAtPoint (svg, x, y) {
  if (!svg) { return }
  const elements = svg.querySelectorAll('[data-pdf-annotate-type]')

  // Find a target element within SVG
  for (let i = 0, l = elements.length; i < l; i++) {
    const el = elements[i]
    if (pointIntersectsRect(x, y, getOffsetAnnotationRect(el))) {
      return el
    }
  }

  return null
}

/**
 * Determine if a point intersects a rect
 *
 * @param {Number} x The x coordinate of the point
 * @param {Number} y The y coordinate of the point
 * @param {Object} rect The points of a rect (likely from getBoundingClientRect)
 * @return {Boolean} True if a collision occurs, otherwise false
 */
export function pointIntersectsRect (x, y, rect) {
  return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right
}

/**
 * Get the rect of an annotation element accounting for offset.
 *
 * @param {Element} el The element to get the rect of
 * @return {Object} The dimensions of the element
 */
export function getOffsetAnnotationRect (el) {
  const rect = getAnnotationRect(el)
  const { offsetLeft, offsetTop } = getOffset(el)
  return {
    top: rect.top + offsetTop,
    left: rect.left + offsetLeft,
    right: rect.right + offsetLeft,
    bottom: rect.bottom + offsetTop
  }
}

/**
 * Get the rect of an annotation element.
 *
 * @param {Element} el The element to get the rect of
 * @return {Object} The dimensions of the element
 */
export function getAnnotationRect (svg, el) {
  let h = 0; let w = 0; let x = 0; let y = 0
  const rect = el.getBoundingClientRect()
  // TODO this should be calculated somehow
  const LINE_OFFSET = 16

  switch (el.nodeName.toLowerCase()) {
    case 'path': {
      let minX
      let maxX
      let minY
      let maxY

      el.getAttribute('d').replace(/Z/, '').split('M').splice(1).forEach((p) => {
        var s = p.split(' ').map(i => parseInt(i, 10))

        if (typeof minX === 'undefined' || s[0] < minX) { minX = s[0] }
        if (typeof maxX === 'undefined' || s[2] > maxX) { maxX = s[2] }
        if (typeof minY === 'undefined' || s[1] < minY) { minY = s[1] }
        if (typeof maxY === 'undefined' || s[3] > maxY) { maxY = s[3] }
      })

      h = maxY - minY
      w = maxX - minX
      x = minX
      y = minY
      break
    }
    case 'line': {
      h = parseInt(el.getAttribute('y2'), 10) - parseInt(el.getAttribute('y1'), 10)
      w = parseInt(el.getAttribute('x2'), 10) - parseInt(el.getAttribute('x1'), 10)
      x = parseInt(el.getAttribute('x1'), 10)
      y = parseInt(el.getAttribute('y1'), 10)

      if (h === 0) {
        h += LINE_OFFSET
        y -= (LINE_OFFSET / 2)
      }
      break
    }
    case 'text': {
      h = rect.height
      w = rect.width
      x = parseInt(el.getAttribute('x'), 10)
      y = parseInt(el.getAttribute('y'), 10) - h
      break
    }
    case 'g': {
      const { offsetLeft, offsetTop } = getOffset(el)
      h = rect.height
      w = rect.width
      x = rect.left - offsetLeft
      y = rect.top - offsetTop

      if (el.getAttribute('data-pdf-annotate-type') === 'strikeout') {
        h += LINE_OFFSET
        y -= (LINE_OFFSET / 2)
      }
      break
    }
    case 'rect':
    case 'svg': {
      h = parseInt(el.getAttribute('height'), 10)
      w = parseInt(el.getAttribute('width'), 10)
      x = parseInt(el.getAttribute('x'), 10)
      y = parseInt(el.getAttribute('y'), 10)
      break
    }
  }

  // Result provides same properties as getBoundingClientRect
  let result = {
    top: y,
    left: x,
    width: w,
    height: h,
    right: x + w,
    bottom: y + h
  }

  // For the case of nested SVG (point annotations) and grouped
  // lines or rects no adjustment needs to be made for scale.
  // I assume that the scale is already being handled
  // natively by virtue of the `transform` attribute.
  if (!['svg', 'g'].includes(el.nodeName.toLowerCase())) {
    result = scaleUp(svg, result)
  }

  return result
}

/**
 * Adjust scale from normalized scale (100%) to rendered scale.
 *
 * @param {Number} scale The scale
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled up
 */
export function scaleUp (scale, rect) {
  const result = {}

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] * scale
  })

  return result
}

/**
 * Adjust scale from rendered scale to a normalized scale (100%).
 *
 * @param {Number} scale The scale
 * @param {Object} rect A map of numeric values to scale
 * @return {Object} A copy of `rect` with values scaled down
 */
export function scaleDown (scale, rect) {
  const result = {}

  Object.keys(rect).forEach((key) => {
    result[key] = rect[key] / scale
  })

  return result
}

/**
 * Get the scroll position of an element, accounting for parent elements
 *
 * @param {Element} el The element to get the scroll position for
 * @return {Object} The scrollTop and scrollLeft position
 */
export function getScroll (el) {
  let scrollTop = 0
  let scrollLeft = 0
  let parentNode = el

  while ((parentNode = parentNode.parentNode) &&
          parentNode !== document) {
    scrollTop += parentNode.scrollTop
    scrollLeft += parentNode.scrollLeft
  }

  return { scrollTop, scrollLeft }
}

/**
 * Get the offset position of an element, accounting for parent elements
 *
 * @param {Element} el The element to get the offset position for
 * @return {Object} The offsetTop and offsetLeft position
 */
export function getOffset (el) {
  let parentNode = el

  while ((parentNode = parentNode.parentNode) &&
          parentNode !== document) {
    if (parentNode.nodeName.toUpperCase() === 'SVG') {
      break
    }
  }

  const rect = parentNode.getBoundingClientRect()

  return { offsetLeft: rect.left, offsetTop: rect.top }
}

/**
 * Get the current window selection as rects
 *
 * @return {Array} An Array of rects
 */
export function getSelectionRects (clear) {
  try {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const rects = range.getClientRects()

    if (clear) {
      selection.removeAllRanges()
    }
    if (rects.length > 0 &&
      rects[0].width > 0 &&
      rects[0].height > 0) {
      return rects
    }
  } catch (e) {}

  return null
}

const UPPER_REGEX = /[A-Z]/g

// Don't convert these attributes from camelCase to hyphenated-attributes
const BLACKLIST = [
  'viewBox'
]

const keyCase = (key) => {
  if (BLACKLIST.indexOf(key) === -1) {
    key = key.replace(UPPER_REGEX, match => '-' + match.toLowerCase())
  }
  return key
}

/**
 * Set attributes for a node from a map
 *
 * @param {Node} node The node to set attributes on
 * @param {Object} attributes The map of key/value pairs to use for attributes
 */
export function setAttributes (node, attributes) {
  Object.keys(attributes).forEach((key) => {
    node.setAttribute(keyCase(key), attributes[key])
  })
}

const REGEX_HASHLESS_HEX = /^([a-f0-9]{6}|[a-f0-9]{3})$/i

/**
 * Normalize a color value
 *
 * @param {String} color The color to normalize
 * @return {String}
 */
export function normalizeColor (color) {
  if (REGEX_HASHLESS_HEX.test(color)) {
    color = `#${color}`
  }
  return color
}

const REGEXP = /[xy]/g
const PATTERN = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

function replacement (c) {
  const r = Math.random() * 16 | 0
  const v = c === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
}

/**
 * Generate a univierally unique identifier
 *
 * @return {String}
 */
export function uuid () {
  return PATTERN.replace(REGEXP, replacement)
}
