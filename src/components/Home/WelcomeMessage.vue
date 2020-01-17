<template>
  <div>
    <h3>Hello {{ name }} from my Vue.js page, built with Webpack 4!</h3>
    <div class="toolbar1" style="display: flex;align-items: center;">
      <VueButton class="icon-button primary small"><arrow-top-left-thick-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><eraser-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><check-blank-outline-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><circle-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><circle-double-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><circle-outline-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><cursor-default-outline-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><palette-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><marker-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><format-strikethrough-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><format-text-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><format-size-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><format-color-fill-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><fountain-pen-tip-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><resize-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><format-color-fill-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><comment-text-multiple-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><magnify-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><rotate-left-icon class="normal"/></VueButton>
      <VueButton class="icon-button small"><rotate-right-icon class="normal"/></VueButton>
      <div class="devider"></div>
      <VueButton class="icon-button small"><delete-sweep-outline-icon class="normal"/></VueButton>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  }
}
</script>
