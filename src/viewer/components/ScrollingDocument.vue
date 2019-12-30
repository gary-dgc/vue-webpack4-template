<template>
  <div
    v-scroll.immediate="updateScrollBounds"
    class="scrolling-document"
  >
    <ScrollingPage
      v-for="page in pages"
      :key="page.pageNumber"
      v-slot="{isPageFocused, isElementFocused}"
      v-bind="{page, clientHeight, scrollTop, focusedPage, enablePageJump}"
      @page-jump="onPageJump"
    >
      <div
        class="scrolling-page"
      >
        <slot v-bind="{page, isPageFocused, isElementFocused}" />
      </div>
    </ScrollingPage>

    <div
      v-visible="fetchPages"
      class="observer"
    />
  </div>
</template>

<script>
import scroll from '../directives/scroll.js'
import visible from '../directives/visible.js'

import ScrollingPage from './ScrollingPage.vue'

export default {
  components: {
    ScrollingPage
  },

  directives: {
    visible,
    scroll
  },

  props: {
    pages: {
      required: true,
      type: Array
    },
    enablePageJump: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    isParentVisible: {
      default: true,
      type: Boolean
    }
  },

  data () {
    return {
      focusedPage: undefined,
      scrollTop: 0,
      clientHeight: 0
    }
  },

  computed: {
    pagesLength () {
      return this.pages.length
    }
  },

  watch: {
    isParentVisible: 'updateScrollBounds',

    pagesLength (count, oldCount) {
      if (oldCount === 0) this.$emit('pages-reset')

      // Set focusedPage after new pages are mounted
      this.$nextTick(() => {
        this.focusedPage = this.currentPage
      })
    },

    currentPage (currentPage) {
      if (currentPage > this.pages.length) {
        this.fetchPages(currentPage)
      } else {
        this.focusedPage = currentPage
      }
    }
  },

  methods: {
    fetchPages (currentPage) {
      this.$emit('pages-fetch', currentPage)
    },

    onPageJump (scrollTop) {
      this.$emit('page-jump', scrollTop)
    },

    updateScrollBounds () {
      const { scrollTop, clientHeight } = this.$el
      this.scrollTop = scrollTop
      this.clientHeight = clientHeight
    }
  }
}
</script>
