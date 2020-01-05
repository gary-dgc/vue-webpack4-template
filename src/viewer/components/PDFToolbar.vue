<template>
  <div style="display: flex; align-items: center;">
    <a
      class="icon"
      @click.prevent.stop="togglePreview"
    ><PreviewIcon /></a>
    <div class="pdf-zoom">
      <a
        class="icon"
        @click.prevent.stop="zoomIn"
      ><ZoomInIcon /></a>
      <a
        class="icon"
        @click.prevent.stop="zoomOut"
      ><ZoomOutIcon /></a>
      <a
        class="icon"
        @click.prevent.stop="fitWidth"
      ><ExpandIcon /></a>
      <a
        class="icon"
        @click.prevent.stop="fitAuto"
      ><ShrinkIcon /></a>
    </div>
    <div class="pdf-paginator">
      <input
        :value="currentPage"
        min="1"
        :max="pageCount"
        type="number"
        @input="jumpPage"
      > / <span>{{ pageCount }}</span>
    </div>
    <div style="flex: 1 1 auto; display: flex; margin-left: 10px">
      <a
        class="icon"
        :class="{active: action === 'edit'}"
        @click.prevent.stop="doAction('edit')"
      >E</a>
      <a
        class="icon"
        :class="{active: action === 'area'}"
        @click.prevent.stop="doAction('area')"
      >A</a>
      <a
        class="icon"
        :class="{active: action === 'highlight'}"
        @click.prevent.stop="doAction('highlight')"
      >H</a>
      <a
        class="icon"
        :class="{active: action === 'strikeout'}"
        @click.prevent.stop="doAction('strikeout')"
      >S</a>
    </div>
  </div>
</template>

<script>
import ZoomInIcon from '../assets/icon-zoom-in.svg'
import ZoomOutIcon from '../assets/icon-zoom-out.svg'
import ExpandIcon from '../assets/icon-expand.svg'
import ShrinkIcon from '../assets/icon-shrink.svg'
import PreviewIcon from '../assets/icon-preview.svg'
export default {
  name: 'PDFToolbar',
  components: {
    PreviewIcon,
    ZoomInIcon,
    ZoomOutIcon,
    ExpandIcon,
    ShrinkIcon
  },
  props: {
    scale: { type: Number, default: 1.0 },
    currentPage: { type: Number, default: 1 },
    pageCount: { type: Number, default: 0 },
    isPreviewEnabled: { type: Boolean },
    togglePreview: { type: Function, default: () => {} },
    updateFit: { type: Function, default: () => {} },
    updateScale: { type: Function, default: () => {} },
    updateCurrentPage: { type: Function, default: () => {} },
    annoAction: { type: Function, default: () => {} },
    increment: {
      type: Number,
      default: 0.25
    }
  },
  data () {
    return {
      action: 'edit'
    }
  },
  methods: {
    jumpPage (event) {
      this.updateCurrentPage(parseInt(event.target.value, 10))
    },
    zoomIn () {
      this.updateScale(this.scale + this.increment)
    },
    zoomOut () {
      if (this.scale <= this.increment) return
      this.updateScale(this.scale - this.increment)
    },
    fitWidth () {
      this.updateFit('width')
    },

    fitAuto () {
      this.updateFit('auto')
    },
    doAction (action) {
      this.action = action
      this.annoAction(action)
    }
  }
}
</script>
<style>
.pdf-zoom a {
  float: left;
  cursor: pointer;
  display: block;
  border: 1px #333 solid;
  background: white;
  color: #333;
  font-weight: bold;
  line-height: 1.5em;
  width: 1em;
  height: 1em;
  font-size: 1.5em;
}
.pdf-paginator {
  color: white;
  font-weight: bold;
}
.pdf-paginator input {
  width: 2em;
  padding: 0.3em;
}
a.icon.active{
  background-color:#d4d4d4;
}
</style>
