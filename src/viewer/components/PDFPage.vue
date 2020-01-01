<template>
  <div
    v-visible.once="drawPage"
    class="pdf-page box-shadow"
    :style="pageStyle"
  >
    <canvas
      ref="canvas"
      v-bind="canvasAttrs"
    />
    <PDFAnno
      ref="anno-layer"
      v-bind="{scale, page}"
    />
  </div>
</template>

<script>
import debug from 'debug'
import PDFAnno from './PDFAnno'
import { PIXEL_RATIO } from '../utils/constants'
import visible from '../directives/visible.js'
const log = debug('app:components/PDFPage')

export default {
  name: 'PDFPage',
  components: { PDFAnno },
  directives: {
    visible
  },

  props: {
    page: {
      type: Object, // instance of PDFPageProxy returned from pdf.getPage
      required: true
    },
    scale: {
      type: Number,
      required: true
    },
    optimalScale: {
      type: Number,
      required: true
    },
    isPageFocused: {
      type: Boolean,
      default: false
    },
    isElementFocused: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    actualSizeViewport () {
      return this.viewport.clone({ scale: this.scale })
    },

    pageStyle () {
      const { width: actualSizeWidth, height: actualSizeHeight } = this.actualSizeViewport
      const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight]
        .map(dim => Math.ceil(dim / PIXEL_RATIO))
      return `width: ${pixelWidth}px; height: ${pixelHeight}px;`
    },

    canvasAttrs () {
      let { width, height } = this.viewport;
      [width, height] = [width, height].map(dim => Math.ceil(dim))
      const style = this.pageStyle

      return {
        width,
        height,
        style
      }
    },

    pageNumber () {
      return this.page.pageNumber
    }
  },

  watch: {
    scale: 'updateVisibility',

    page (_newPage, oldPage) {
      this.destroyPage(oldPage)
    },

    isElementFocused (isElementFocused) {
      if (isElementFocused) this.focusPage()
    }
  },

  created () {
    // PDFPageProxy#getViewport
    // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
    this.viewport = this.page.getViewport({ scale: this.optimalScale })
  },

  mounted () {
    log(`Page ${this.pageNumber} mounted`)
  },

  beforeDestroy () {
    this.destroyPage(this.page)
  },

  methods: {
    focusPage () {
      if (this.isPageFocused) return

      this.$emit('page-focus', this.pageNumber)
    },

    drawPage () {
      if (this.renderTask) return

      const { viewport } = this
      const canvasContext = this.$refs.canvas.getContext('2d')
      const renderContext = { canvasContext, viewport }

      // PDFPageProxy#render
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      this.renderTask = this.page.render(renderContext)
      this.renderTask.promise
        .then(() => {
          this.$emit('page-rendered', {
            page: this.page,
            text: `Rendered page ${this.pageNumber}`
          })
          this.$refs['anno-layer'].renderAnno()
        })
        .catch(response => {
          this.destroyRenderTask()
          this.$emit('page-errored', {
            response,
            page: this.page,
            text: `Failed to render page ${this.pageNumber}`
          })
        })
    },

    updateVisibility () {
      this.$parent.$emit('update-visibility')
      console.log(this.optimalScale)
      this.destroyRenderTask() //
      this.viewport = this.page.getViewport({ scale: this.scale }) //
      this.drawPage() //
    },

    destroyPage (page) {
      // PDFPageProxy#_destroy
      // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
      if (page) page._destroy()

      this.destroyRenderTask()
    },

    destroyRenderTask () {
      if (!this.renderTask) return

      // RenderTask#cancel
      // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
      this.renderTask.cancel()
      delete this.renderTask
    }
  }
}
</script>
<style>
.pdf-page {
  display: block;
  position: relative;
  margin: 0 auto;
}

</style>
