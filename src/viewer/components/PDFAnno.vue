<template>
  <div
    class="anno-edit"
    :style="style"
  >
    <div
      ref="note-input"
      class="anno-note"
    >
      <input
        class="anno-note-input"
        placeholder="Pls add note"
      >
    </div>
  </div>
</template>
<script>
const OFFSET = { x: 5, y: 5 }
export default {
  name: 'AnnoEdit',
  props: {
    scale: {
      type: Number,
      default: 1.0
    },
    data: {
      type: Object,
      default: () => {}
    },
    annotator: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    style () {
      const { x, y, width, height } = this.data
      return {
        top: `${y - OFFSET.y}px`,
        left: `${x - OFFSET.x}px`,
        width: `${width + OFFSET.x * 2}px`,
        height: `${height + OFFSET.y * 2}px`
      }
    }
  },
  destroyed () {
    this.annotator.show(this.data.uuid, true)
  },
  mounted () {
    this.annotator.show(this.data.uuid, false)
  },
  methods: {

  }
}
</script>
<style>
.anno-edit{
  position: absolute;
  border: 2px dashed black;
  filter:alpha(opacity = 10);
  opacity:0.1;
  background-color:green;
}
.anno-note{
  position: absolute;
  top: calc( 50% - 10px );
  display: flex;
  align-items: center;
}
.anno-note-input{
  border: none;
  display: none;
  font-size: 12px;
  background-color: rgba(51, 170, 51, .1);
}
</style>
