<template>
  <div
    class="anno-wrapper"
    @mousedown.left="onMouseDown($event)"
    @mouseup.left="onMouseUp($event)"
    @mousemove.left="onMouseMove($event)"
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
import { getAnnonator } from '../annonator'

export default {
  name: 'PDFAnnoLayer',
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
  destroyed () {
    if (!this.annonator) return
    this.annonator.release()
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
        // prepare the annonator
        this.annonator = getAnnonator({
          pageNumber: this.page.pageNumber,
          viewport: this.viewport,
          svg: this.$refs['anno-layer']
        })
      })
    },
    onMouseDown (e) {
      if (!this.annonator) return
      this.annonator.handleMousedown(e)
    },
    onMouseUp (e) {
      if (!this.annonator) return
      this.annonator.handleMouseup(e)
    },
    onMouseMove (e) {
      if (!this.annonator) return

      this.annonator.handleMousemove(e)
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
