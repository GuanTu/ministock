<template>
  <q-layout view="hHh Lpr fFf" class="shadow-2 rounded-borders" @resize="onReset">
    <q-header class="bg-cyan">
      <q-bar class="q-electron-drag">
        <q-btn dense flat  icon="add" class="q-electron-drag--exception"  @click="basic=true" />

        <q-space />
        <!-- <div>MiniStock</div> -->

        <q-space />

        <q-btn dense flat :icon="!!isTop ? 'lock':'lock_open'" @click="topApp" :color="!!isTop ? 'red':''"/>
        <q-btn dense flat icon="minimize" @click="minimize" />
        <!-- <q-btn dense flat icon="crop_square" @click="maximize" /> -->
        <q-btn dense flat icon="ion-logo-github" @click="openGitHub"/>
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page>
        <q-markup-table dense flat>
          <thead>
            <tr>
              <th class="text-left">名称</th>
              <th class="text-left">最新</th>
              <th class="text-left">涨幅</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(info, index) in stockList" :key="info.stockCode">
              <td class="text-left" :title="info.stockCode">{{info.name || '--'}}</td>
              <td class="text-left" >{{info.price || '--'}}</td>
              <td class="text-left" >{{info.increase ? info.increase+'%' : '--'}}</td>
              <q-menu
                touch-position
                context-menu
              >
                <q-btn flat dense v-close-popup label="删除" color="red" @click="removeStock(index)"/>
                <q-btn flat dense v-close-popup label="详情" color="primary" @click="showK(info)"/>
              </q-menu>
            </tr>
          </tbody>
        </q-markup-table>

        <q-dialog v-model="basic" transition-show="rotate" transition-hide="rotate">
          <q-card class="q-pa-md">
            <form @submit.prevent.stop="addStock">
              <q-select ref="areaCode" dense options-dense v-model="areaCode" :options="areaOption"
                  label="沪/深" :rules="[val => !!val || '请选择一个']" />
              <q-input ref="stockCode" dense v-model="stockCode" label="代码"
                  :rules="[val => !!val || '请填写一个']"/>
              <q-card-actions dense align="right">
                <q-btn flat dense type="submit" label="添加" color="primary"/>
              </q-card-actions>
            </form>
          </q-card>
        </q-dialog>

        <StockDetail v-if="isShowK" :areaCode="areaCode" :stockCode="stockCode"></StockDetail>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import StockDetail from 'components/StockDetail.vue'

const offset = 62 + 32

export default {
  name: 'Main',
  components: {
    StockDetail
  },
  data () {
    return {
      basic: false,
      isTop: false,
      areaOption: [{ label: '沪', value: 'sh' }, { label: '深', value: 'sz' }],
      areaCode: '',
      stockCode: '',
      timeOutId: '',
      panelsStyle: {
        height: (window.innerHeight - offset) + 'px'
      },
      // stockList: [
      //   { areaCode: 'sz', stockCode: '002174', t: '' },
      //   { areaCode: 'sz', stockCode: '002751', t: '' }
      // ]
      stockList: [],
      isShowK: false
    }
  },
  mounted () {
    const stockList = this.$q.localStorage.getItem('stockList')
    if (stockList) {
      this.stockList = stockList
    }
    if (this.stockList) {
      const $this = this
      $this.each($this)
    }
  },
  methods: {
    minimize () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
      }
    },
    maximize () {
      if (process.env.MODE === 'electron') {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()

        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    },
    closeApp () {
      if (process.env.MODE === 'electron') {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
      }
    },
    topApp () {
      if (process.env.MODE === 'electron') {
        const isTop = this.$q.electron.remote.BrowserWindow.getFocusedWindow().isAlwaysOnTop()
        if (!isTop) {
          this.$q.electron.remote.BrowserWindow.getFocusedWindow().setAlwaysOnTop(true)
          this.isTop = true
        } else {
          this.$q.electron.remote.BrowserWindow.getFocusedWindow().setAlwaysOnTop(false)
          this.isTop = false
        }
      }
    },
    onReset (size) {
      const height = window.innerHeight - offset
      this.panelsStyle.height = height + 'px'
    },
    openGitHub () {
      this.$q.electron.shell.openExternal('https://github.com/GuanTu/ministock')
    },
    addStock () {
      this.$refs.areaCode.validate()
      this.$refs.stockCode.validate()
      if (this.$refs.areaCode.hasError || this.$refs.stockCode.hasError) {
        return
      }
      const stock = {
        areaCode: this.areaCode.value,
        stockCode: this.stockCode
      }

      this.stockList.push(stock)
      this.store()
      this.basic = false
    },
    removeStock (index) {
      this.stockList.splice(index, 1)
      this.store()
    },
    each ($this) {
      if (!$this.timeOutId) {
        $this.timeOutId = setInterval(() => {
          if ($this.stockList) {
            $this.stockList.forEach((i, index) => {
              $this.doGetStockInfo($this, i, index)
            })
          }
        }, 2000)
      }
    },
    doGetStockInfo ($this, stock, index) {
      const url = '/list=' + stock.areaCode + stock.stockCode
      $this.$axios.get(url)
        .then((response) => {
          console.log(response)
          const data = response.data
          if (data) {
            const itemArray = data.split('"')
            try {
              const tmp = itemArray[1].split(',')
              stock.name = tmp[0]
              stock.price = tmp[3]
              stock.increase = ((stock.price / tmp[2] - 1) * 100).toFixed(2)

              // $this.stockList[index] = stock
              $this.$set($this.stockList, index, stock)
            } catch (err) {
              console.error(err)
            }
          }
        })
        .catch(() => {
          $this.$q.notify({
            color: 'negative',
            position: 'top',
            message: '请求失败！',
            icon: 'report_problem'
          })
        })
    },
    store () {
      const storeList = []
      this.stockList.forEach(e => {
        const obj = {
          areaCode: e.areaCode,
          stockCode: e.stockCode
        }
        storeList.push(obj)
      })
      this.$q.localStorage.set('stockList', storeList)
    },
    showK (info) {
      this.isShowK = false
      this.areaCode = info.areaCode
      this.stockCode = info.stockCode
      this.isShowK = true
    }
  }

}
</script>
