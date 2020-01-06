<template>
  <div
    class="anno-container"
    @mousedown.left="onMouseDown($event)"
    @mouseup.left="onMouseUp($event)"
    @mousemove="onMouseMove($event)"
    @mouseleave.left="onMouseLeave($event)"
  >
    <svg
      ref="anno-layer"
      class="annoLayer"
      v-bind="svgAttrs"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="red-arrowhead"
          viewBox="0 0 14 14"
          refX="10"
          refY="7"
          markerUnits="strokeWidth"
          markerWidth="6"
          markerHeight="4"
          orient="auto"
        >
          <path
            d="M 5 7 L 0 0 L 14 7 L 0 14 L 5 7 z"
            stroke="none"
            fill="red"
          />
        </marker>
      </defs>
    </svg>
    <div
      ref="text-layer"
      class="textLayer"
      v-bind="textAttrs"
    />
    <PDFAnno
      v-if="active.uuid"
      :key="active.uuid"
      :data="active"
      :annotator="annotator"
      :scale="scale"
    />
  </div>
</template>

<script>
import pdfjsLib from 'pdfjs-dist/webpack.js'
import { getAnnotator, getAnnoInfo } from '../annotator'
import { PIXEL_RATIO } from '../utils/constants'
import PDFAnno from './PDFAnno'
function floor (value, precision) {
  const multiplier = Math.pow(10, precision || 0)
  return Math.floor(value * multiplier) / multiplier
}

export default {
  name: 'AnnoLayer',
  components: {
    PDFAnno
  },
  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true
    }
  },
  data () {
    return {
      viewport: undefined,
      annotations: [],
      active: {},
      scale: undefined,
      annoType: getAnnoInfo().anno_type,
      annotator: undefined
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
    if (this.annotator) {
      this.annotator.release()
    }
  },
  methods: {
    renderAnno () {
      this.viewport = this.$parent.actualSizeViewport
      const defaultViewport = this.viewport.clone({ scale: 1.0 })
      const textLayerDiv = this.$refs['text-layer']

      this.scale = floor(textLayerDiv.clientWidth / defaultViewport.width, 2)
      const textViewport = this.page.getViewport({ scale: this.scale })
      if (this.annotator) {
        this.annotator.remove()
      }
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
        // prepare the annotator
        this.annotator = getAnnotator({
          pageNumber: this.page.pageNumber,
          viewport: textViewport,
          svg: this.$refs['anno-layer'],
          callback: function () { this.onAnnoEvent(...arguments) }.bind(this)
        })
        this.annotator.render()
        this.annoType = this.annotator.type
      })
    },
    onAnnoEvent ({ type, setting, data }) {
      if (['highlight', 'strikeout', 'area', 'edit'].includes(type)) {
        this.annoType = type
      } else if (type === 'anno:add') {
        this.annotations.push(data)
        this.annotator.render(data)
      } else if (type === 'anno:focus') {
        if (data.uuid !== this.active.uuid) {
          this.active = data
        }
      } else if (type === 'anno:blur') {
        this.active = {}
      }
    },
    onMouseDown (e) {
      if (!this.annotator) return
      this.annotator.handleMousedown(e)
    },
    onMouseUp (e) {
      if (!this.annotator) return
      this.annotator.handleMouseup(e)
    },
    onMouseMove (e) {
      if (!this.annotator) return
      this.annotator.handleMousemove(e)
    },
    onMouseLeave (e) {
      if (!this.annotator) return
      this.annotator.handleMouseleave(e)
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
