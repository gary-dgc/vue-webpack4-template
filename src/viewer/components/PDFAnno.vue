<template>
  <div
    class="anno-edit"
    :style="style"
    @mousedown.stop="onMousedown($event)"
    @mouseup.stop="onMouseup($event)"
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
    <div
      class="anno-button"
      @click.stop="onAnnoDelete"
      @mousedown.stop="()=>{}"
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 512 512"
        xml:space="preserve"
      >
        <g>
          <polygon points="353.574,176.526 313.496,175.056 304.807,412.34 344.885,413.804" />
          <rect
            x="235.948"
            y="175.791"
            width="40.104"
            height="237.285"
          />
          <polygon points="207.186,412.334 198.497,175.049 158.419,176.52 167.109,413.804" />
          <path
            d="M17.379,76.867v40.104h41.789L92.32,493.706C93.229,504.059,101.899,512,112.292,512h286.74
            c10.394,0,19.07-7.947,19.972-18.301l33.153-376.728h42.464V76.867H17.379z M380.665,471.896H130.654L99.426,116.971h312.474
            L380.665,471.896z"
          />
        </g>
        <g>
          <path
            d="M321.504,0H190.496c-18.428,0-33.42,14.992-33.42,33.42v63.499h40.104V40.104h117.64v56.815h40.104V33.42
            C354.924,14.992,339.932,0,321.504,0z"
          />
        </g>
      </svg>
    </div>
    <div
      v-if="isMovable"
      class="anno-button anno-drag"
      @mousemove.stop="onMousemove($event)"
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 215.35 215.35"
        style="enable-background:new 0 0 215.35 215.35;"
        xml:space="preserve"
      >
        <g>
          <path
            d="M7.5,65.088c4.143,0,7.5-3.358,7.5-7.5V25.61l48.305,48.295c1.465,1.464,3.384,2.196,5.303,2.196
            c1.92,0,3.84-0.732,5.304-2.197c2.929-2.929,2.929-7.678-0.001-10.606L25.604,15.002h31.985c4.142,0,7.5-3.358,7.5-7.5
            c0-4.142-3.357-7.5-7.5-7.5H7.5c-4.143,0-7.5,3.358-7.5,7.5v50.087C0,61.73,3.357,65.088,7.5,65.088z"
          />
          <path
            d="M207.85,150.262c-4.143,0-7.5,3.358-7.5,7.5v31.979l-49.792-49.792c-2.93-2.929-7.678-2.929-10.607,0
            c-2.929,2.929-2.929,7.678,0,10.606l49.791,49.791h-31.977c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h50.086
            c4.143,0,7.5-3.358,7.5-7.5v-50.084C215.35,153.62,211.992,150.262,207.85,150.262z"
          />
          <path
            d="M64.792,139.949L15.005,189.74v-31.978c0-4.142-3.357-7.5-7.5-7.5s-7.5,3.358-7.5,7.5v50.086c0,4.142,3.357,7.5,7.5,7.5
            h50.084c4.142,0,7.5-3.358,7.5-7.5s-3.357-7.5-7.5-7.5H25.611l49.788-49.793c2.929-2.929,2.929-7.678-0.001-10.607
            C72.471,137.02,67.722,137.02,64.792,139.949z"
          />
          <path
            d="M207.85,0.002h-50.086c-4.143,0-7.5,3.358-7.5,7.5c0,4.142,3.357,7.5,7.5,7.5h31.979l-48.298,48.301
            c-2.929,2.929-2.929,7.678,0.001,10.607c1.464,1.464,3.384,2.196,5.303,2.196c1.919,0,3.839-0.733,5.304-2.197l48.298-48.301v31.98
            c0,4.142,3.357,7.5,7.5,7.5c4.143,0,7.5-3.358,7.5-7.5V7.502C215.35,3.359,211.992,0.002,207.85,0.002z"
          />
        </g>
      </svg>
    </div>
  </div>
</template>
<script>
const OFFSET = { x: 2, y: 2 }
const MIN = { width: 60, height: 20 }
export default {
  name: 'AnnoEdit',
  props: {
    scale: {
      type: Number,
      default: 1.0
    },
    mode: {
      type: String,
      default: ''
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
  data () {
    return {
      origin: Object.assign({}, this.data),
      isDown: false,
      offset: { x: 0, y: 0 }
    }
  },
  computed: {
    style () {
      console.log(this.data)
      let { x, y, width, height } = this.origin
      if (width < MIN.width) {
        x -= (MIN.width - width) / 2
        width = MIN.width
      }
      if (height < MIN.height) {
        y -= (MIN.height - height) / 2
        height = MIN.height
      }
      return {
        top: `${y - OFFSET.y}px`,
        left: `${x - OFFSET.x}px`,
        width: `${width + OFFSET.x * 2}px`,
        height: `${height + OFFSET.y * 2}px`
      }
    },
    isMovable () {
      return !['highlight', 'strikeout'].includes(this.data.type)
    }
  },
  destroyed () {
    this.annotator.show(this.data.uuid, true)
  },
  mounted () {
    this.annotator.show(this.data.uuid, false)
  },
  methods: {
    onAnnoDelete () {
      this.annotator.remove(this.data)
    },
    onMousedown (e) {
      this.isDown = true
      if (this.mode === 'focus') {
        this.annotator.handleMousedown(e)
      }
      this.offset.x = this.origin.x - e.clientX
      this.offset.y = this.origin.y - e.clientY
    },
    onMouseup (e) {
      this.isDown = false
      const offset = {
        x: this.origin.x - this.data.x,
        y: this.origin.y - this.data.y
      }
      this.annotator.handleMouseup(e, { uuid: this.data.uuid, offset })
    },
    onMousemove (e) {
      if (this.isDown) {
        const { clientX, clientY } = e
        this.origin.x = clientX + this.offset.x
        this.origin.y = clientY + this.offset.y
      }
    }
  }
}
</script>
<style>
.anno-edit{
  position: absolute;
  border: 2px dashed gray;
  cursor: default;
  /* filter:alpha(opacity = 10);
   opacity:0.1;
   background-color:green; */
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
.anno-edit .anno-button{
  color: gray;
  width: 24px;
  height: 24px;
  padding: 2px;
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
}

.anno-button.anno-drag{
  color: gray;
  width: 22px;
  height: 22px;
  padding: 2px;
  position: absolute;
  top: 5px;
  right: 31px;
  cursor: pointer;
}

.anno-edit .anno-button > svg{
  width: 18px;
  height: 18px;
  fill:gray;
}
.anno-edit .anno-button:hover > svg{
  fill:#444;
}
</style>
