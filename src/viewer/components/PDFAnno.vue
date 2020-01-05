<template>
  <div class="anno-edit" />
</template>
<script>
export default {
  name: 'Anno',
  props: {
    scale: {
      type: Number,
      default: 1.0
    },
    data: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
    }
  },

  methods: {

  }
}
</script>
<style scoped>
.anno-edit{
  border: 2px solid red;
}
</style>
