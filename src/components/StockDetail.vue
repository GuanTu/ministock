<template>
  <q-card class="my-card" flat>
    <q-card-actions >
      <q-btn flat dense color="red" label="时K" @click="kSelect = 1"/>
      <q-btn flat dense color="teal" label="日K" @click="kSelect = 2" />
      <q-btn flat dense color="green" label="周K" @click="kSelect = 3" />
      <q-btn flat dense color="primary" label="月K" @click="kSelect = 4" />
      <q-space />
      <q-btn flat dense color="primary" icon="close" @click="closeShow" />
    </q-card-actions>

    <q-img :src="kImgUrl" />
  </q-card>
</template>

<script>
export default {
  name: 'StockDetail',
  props: {
    areaCode: {
      type: String,
      required: true
    },
    stockCode: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      kSelect: 1,
      timeOutId: '',
      t: new Date().getTime()
    }
  },
  mounted () {
    const $this = this
    setInterval(() => {
      $this.t = new Date().getTime()
    }, 60 * 1000)
  },
  computed: {
    kImgUrl: {
      get () {
        const uriKey = this.getImageType(this.kSelect)
        const httpUrl = 'http://image.sinajs.cn/newchart/' + uriKey + '/n/' + this.areaCode + this.stockCode + '.gif?t=' + this.t
        return httpUrl
      },
      set (newValue) {
      }
    }
  },
  methods: {
    closeShow () {
      this.$root.$children[0].$children[0].isShowK = false
    },
    getImageType (key) {
      let uriKey = 'min'
      if (key === 2) {
        uriKey = 'daily'
      } else if (key === 3) {
        uriKey = 'weekly'
      } else if (key === 4) {
        uriKey = 'monthly'
      }
      return uriKey
    }
  }
}
</script>

<style lang="sass">
.my-menu-link
  background: #F2C037
</style>
