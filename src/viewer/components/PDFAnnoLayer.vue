<template>
  <div
    class="anno-container"
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
      class="textLayer"
      v-bind="textAttrs"
    />
  </div>
</template>

<script>
import pdfjsLib from 'pdfjs-dist/webpack.js'
import { getAnnonator, getAnnoInfo } from '../annonator'
import { PIXEL_RATIO } from '../utils/constants'

function floor (value, precision) {
  const multiplier = Math.pow(10, precision || 0)
  return Math.floor(value * multiplier) / multiplier
}

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
      annotations: [],
      listener: () => {},
      annoType: getAnnoInfo().anno_type
    }
  },
  computed: {
    svgAttrs () {
      if (!this.viewport) return {}

      const { width, height } = this.viewport
      const [pixelWidth, pixelHeight] = [width, height].map(dim => Math.ceil(dim / PIXEL_RATIO))
      return {
        width: Math.ceil(width),
        height: Math.ceil(height),
        style: `width: ${pixelWidth}px; height: ${pixelHeight}px;`
      }
    },
    textAttrs () {
      const visibility = ['highlight', 'strikeout'].includes(this.annoType) ? 'visible' : 'hidden'
      return {
        style: `visibility: ${visibility}`
      }
    }
  },
  destroyed () {
    if (this.annonator) {
      this.annonator.release()
    }
  },
  methods: {
    renderAnno () {
      this.viewport = this.$parent.actualSizeViewport
      const defaultViewport = this.viewport.clone({ scale: 1.0 })
      const textLayerDiv = this.$refs['text-layer']

      const textLayerScale = floor(textLayerDiv.clientWidth / defaultViewport.width, 2)
      const textViewport = this.page.getViewport({ scale: textLayerScale });

      [].slice.call(textLayerDiv.children).forEach((child) => {
        textLayerDiv.removeChild(child)
      })

      this.page.getTextContent().then(textContent => {
        const textLayer = pdfjsLib.renderTextLayer({
          container: textLayerDiv,
          textContent: textContent,
          viewport: textViewport
        })

        textLayer._render()
        // prepare the annonator
        this.annonator = getAnnonator({
          pageNumber: this.page.pageNumber,
          viewport: textViewport,
          svg: this.$refs['anno-layer'],
          callback: function () { this.onAnnoEvent(...arguments) }.bind(this)
        })
      })
    },
    onAnnoEvent ({ type, setting, data, anno }) {
      if (type) {
        this.annoType = type
      }
      if (anno) {
        console.log(anno)
        this.annonator.render(anno)
      }
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
.anno-container{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

</style>
