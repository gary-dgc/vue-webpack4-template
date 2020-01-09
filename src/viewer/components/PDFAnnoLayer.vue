<template>
  <div
    class="anno-container"
    @mousedown.left="onMouseDown($event)"
    @mouseup.left="onMouseUp($event)"
    @mousemove.left="onMouseMove($event)"
    @mouseleave.left="onMouseLeave($event)"
    @keyup="onBoardKeyup($event)"
  >
    <svg
      ref="anno-layer"
      class="annoLayer"
      v-bind="svgAttrs"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- // Arrow Marker use for line -->
        <marker
          id="red-arrowhead"
          viewBox="0 0 20 20"
          refX="10"
          refY="10"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 7 10 L 0 3 L 20 10 L 0 17 L 7 10 z"
            stroke="none"
            fill="red"
          />
        </marker>
        <!-- // blast use for point -->
        <svg
          id="blast-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 150 150"
        >
          <polygon
            style="fill:#FFFF00; stroke:#FF0000; stroke-width:4.375; stroke-miterlimit:7;"
            points="76.435,10.906 60.356,48.289 44.052,30.703 44.239,56.352 9.122,43.383 34.458,67.625 18.771,76.062 37.552,82.461 10.606,98.633 44.231,96.242 45.177,121 59.88,98.805 71.356,111.414 75.896,100.906 94.771,114.234 92.083,99.344 127.083,116.406 102.09,91.312 125.551,77.836 100.442,73.93 123.771,52.727 89.176,58.445 98.286,32.141 78.997,46.953"
          />
          <polygon
            style="fill:#FF0000;"
            points="79.474,0 77.504,5.422 79.192,45.531 83.114,42.922"
          />
          <polygon
            style="fill:#FF0000;"
            points="131.215,50.367 127.715,50.609 101.786,73.914 106.301,75.297"
          />
          <polygon
            style="fill:#FF0000;"
            points="132.278,77.602 129.286,76.93 103.583,91.883 107.708,94.188"
          />
          <polygon
            style="fill:#FF0000;"
            points="133.293,120.695 140.301,124.32 107.388,89.016 105.926,93.492"
          />
          <polygon
            style="fill:#FF0000;"
            points="140.301,124.32 124.911,116.422 93.731,100.828 94.099,105.531"
          />
          <polygon
            style="fill:#FF0000;"
            points="96.528,116.844 98.918,120.508 97.981,103.234 92.06,99.867"
          />
          <polygon
            style="fill:#FF0000;"
            points="43.786,121.781 44.325,129.383 63.497,105.688 58.45,102.258"
          />
          <polygon
            style="fill:#FF0000;"
            points="7.224,99.125 0.997,102.5 44.083,101.195 44.06,96.789"
          />
          <polygon
            style="fill:#FF0000;"
            points="71.942,113.914 73.426,117.312 79.192,103.398 76.411,101.539"
          />
          <polygon
            style="fill:#FF0000;"
            points="73.426,117.312 70.692,111.992 59.95,100.75 57.13,102.922"
          />
          <polygon
            style="fill:#FF0000;"
            points="98.918,120.508 97.138,116.211 77.106,102.969 74.051,105.531"
          />
          <polygon
            style="fill:#FF0000;"
            points="103.388,26.477 100.872,28.445 90.458,58.812 95.083,57.891"
          />
        </svg>
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
      :mode="mode"
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
      mode: '', // the state of annotation [edit | focus]
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
      if (['highlight', 'strikeout', 'area', 'edit', 'pen', 'line', 'drawing', 'text', 'point'].includes(type)) {
        this.annoType = type
      } else if (type === 'anno:add') {
        this.annotations.push(data)
        this.annotator.render(data)
      } else if (type === 'anno:focus') {
        this.mode = 'focus'
        if (data.uuid !== this.active.uuid) {
          // only another annotation reassign
          this.active = data
        }
      } else if (type === 'anno:blur') {
        this.active = {}
        this.mode = 'blur'
      } else if (type === 'anno:edit') {
        this.mode = 'edit'
        if (data.uuid !== this.active.uuid) {
          // only another annotation reassign
          this.active = data
        }
      } else if (type === 'anno:cancel') {
        this.mode = 'cancel'
        if (data.uuid === this.active.uuid) {
          // only another annotation reassign
          this.active = {}
        }
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
    },
    onBoardKeyup (e) {
      if (!this.annotator) return
      this.annotator.handleKeyup(e)
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
