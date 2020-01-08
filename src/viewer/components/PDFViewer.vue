<template>
  <div class="pdf-viewer">
    <header class="pdf-viewer__header box-shadow">
      <PDFToolbar v-bind="{scale, updateFit, updateScale, currentPage, updateCurrentPage, pageCount, togglePreview, isPreviewEnabled, annoAction}" />
    </header>
    <PDFData
      class="pdf-viewer__main"
      :url="url"
      @page-count="updatePageCount"
      @page-focus="updateCurrentPage"
      @document-rendered="onDocumentRendered"
      @document-errored="onDocumentErrored"
    >
      <template v-slot:preview="{pages}">
        <PDFPreview
          v-show="isPreviewEnabled"
          class="pdf-viewer__preview"
          v-bind="{pages, scale, currentPage, pageCount, isPreviewEnabled}"
        />
      </template>

      <template v-slot:document="{pages}">
        <PDFDocument
          class="pdf-viewer__document"
          :class="{ 'preview-enabled': isPreviewEnabled }"
          v-bind="{pages, scale, fit, currentPage, pageCount, isPreviewEnabled}"
          @scale-change="updateScale"
        />
      </template>
    </PDFData>
  </div>
</template>

<script>
import { setAnnoInfo, enableAnno, fireAnnoEvent } from '../annotator'
import PDFDocument from './PDFDocument.vue'
import PDFToolbar from './PDFToolbar.vue'
import PDFData from './PDFData.vue'
import PDFPreview from './PDFPreview.vue'
import 'pdfjs-dist/web/pdf_viewer.css'

function floor (value, precision) {
  const multiplier = Math.pow(10, precision || 0)
  return Math.floor(value * multiplier) / multiplier
}

export default {
  name: 'PDFViewer',
  components: {
    PDFDocument,
    PDFToolbar,
    PDFData,
    PDFPreview
  },
  props: {
    url: { type: String, default: '' }
  },
  data () {
    return {
      scale: undefined,
      fit: undefined,
      currentPage: 1,
      pageCount: undefined,
      isPreviewEnabled: false
    }
  },
  watch: {
    url () {
      this.currentPage = undefined
      console.log('sdfsdf')
    }
  },
  created () {
    // catch the keyup event from window
    window.addEventListener('keyup', this.onKeyupEvent)
  },
  mounted () {
    setAnnoInfo({ doc_id: 'D0101012' })
    document.body.classList.add('overflow-hidden')
  },
  destroyed () {
    // remove the keyup event from window
    window.removeEventListener('keyup', this.onKeyupEvent)
  },
  methods: {
    onKeyupEvent (e) {
      fireAnnoEvent('anno:event', { type: 'keyup', data: e })
    },
    onDocumentRendered () {
      this.$emit('document-errored', this.url)
    },
    onDocumentErrored (e) {
      this.$emit('document-errored', e)
    },
    updateScale (scale) {
      const roundedScale = floor(scale, 2)
      this.scale = roundedScale
    },
    updateFit (fit) {
      this.fit = fit
    },
    updatePageCount (pageCount) {
      this.pageCount = pageCount
    },
    updateCurrentPage (pageNumber) {
      this.currentPage = pageNumber
    },
    togglePreview () {
      this.isPreviewEnabled = !this.isPreviewEnabled
    },
    annoAction (type) {
      enableAnno({ type })
    }
  }
}
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 1em;
  position: relative;
  z-index: 99;
}
.header-item {
  margin: 0 2.5em;
}

.pdf-viewer .pdf-viewer__document,
.pdf-viewer .pdf-viewer__preview {
  top: 70px;
}

.pdf-viewer__preview {
  display: block;
  width: 15%;
  right: 85%;
}

.pdf-viewer__document {
  top: 70px;
  width: 100%;
  left: 0;
}

.pdf-viewer__document.preview-enabled {
  width: 85%;
  left: 15%;
}

@media print {
  header {
    display: none;
  }
}
</style>
