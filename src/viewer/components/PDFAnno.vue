<template>
  <div
    class="anno-wrapper"
    @mousedown.left="onMouseDown"
    @mouseup.left="onMouseUp"
  >
    <svg
      ref="anno-layer"
      v-bind="svgAttrs"
    />
    <div
      ref="text-layer"
      class="text-layer"
    />
  </div>
</template>

<script>
import pdfjsLib from 'pdfjs-dist/webpack.js'
/**
 * Get the current window selection as rects
 *
 * @return {Array} An Array of rects
 */
function getSelectionRects () {
  try {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const rects = range.getClientRects()

    if (rects.length > 0 &&
        rects[0].width > 0 &&
        rects[0].height > 0) {
      return rects
    }
  } catch (e) {}

  return null
}

export default {
  name: 'PDFAnno',
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true
    },
    scale: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      viewport: undefined,
      annotations: []
    }
  },
  computed: {
    svgAttrs () {
      if (!this.viewport) return {}
      let { width, height } = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim))
      return {
        width,
        height,
        style: `width: ${width}px; height: ${height}px;`
      }
    }
  },
  methods: {
    renderAnno () {
      this.viewport = this.page.getViewport({ scale: this.scale })
      const textLayerDiv = this.$refs['text-layer'];

      [].slice.call(textLayerDiv.children).forEach((child) => {
        textLayerDiv.removeChild(child)
      })

      this.page.getTextContent().then(textContent => {
        const textLayer = pdfjsLib.renderTextLayer({
          container: textLayerDiv,
          textContent: textContent,
          viewport: this.viewport
        })

        textLayer._render()
      })
    },
    onMouseDown (e) {

    },
    onMouseUp (e) {
      const rects = getSelectionRects()
      console.log(rects)
    }
  }
}
</script>

<style>
.anno-wrapper{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.text-layer{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.text-layer > span {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
}
</style>
