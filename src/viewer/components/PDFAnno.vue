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
    <div
      class="anno-button"
      @click.stop="onAnnoDelete"
      @mousedown.stop="()=>{}"
    >
      <svg
        id="Capa_1"
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
  </div>
</template>
<script>
const OFFSET = { x: 2, y: 2 }
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
    onAnnoDelete () {
      this.annotator.remove(this.data)
    }
  }
}
</script>
<style>
.anno-edit{
  position: absolute;
  border: 2px dashed gray;
  cursor: pointer;
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
}
.anno-edit .anno-button > svg{
  width: 20px;
  height: 20px;
  fill:gray;
}
.anno-edit .anno-button:hover > svg{
  fill:#444;
}
</style>
