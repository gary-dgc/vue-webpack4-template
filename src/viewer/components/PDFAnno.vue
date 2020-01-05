<template>
  <div
    class="anno-edit"
    :style="style"
  />
</template>
<script>
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
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`
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
<style scoped>
.anno-edit{
  position: absolute;
  border: 2px dashed gray;

}
</style>
