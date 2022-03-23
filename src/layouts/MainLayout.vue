<template>
  <q-layout
    view="hHh Lpr fFf"
    class="shadow-2 rounded-borders"
    @resize="onReset"
  >
    <q-header class="bg-cyan">
      <q-bar class="q-electron-drag">
        <q-btn
          dense
          flat
          icon="add"
          class="q-electron-drag--exception"
          @click="addStock"
        />
        <q-btn
          dense
          flat
          icon="hardware"
          class="q-electron-drag--exception"
          @click="openDevTool"
        />

        <q-space />
        <!-- <div>MiniStock</div> -->

        <q-space />

        <q-btn
          dense
          flat
          :icon="isTop ? 'lock' : 'lock_open'"
          @click="topApp"
          :color="isTop ? 'red' : ''"
        />
        <q-btn dense flat icon="minimize" @click="minimize" />
        <!-- <q-btn dense flat icon="crop_square" @click="maximize" /> -->
        <q-btn dense flat icon="home" @click="openGitHub" />
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>
    </q-header>

    <q-page-container>
      <q-page>
        <StockTable ref="stockTable"></StockTable>

        <q-dialog
          v-model="basic"
          transition-show="rotate"
          transition-hide="rotate"
        >
          <q-card class="q-pa-md">
            <form @submit.prevent.stop="addStock">
              <q-select
                ref="areaCode"
                dense
                options-dense
                v-model="areaCode"
                :options="areaOption"
                label="沪/深"
                :rules="[(val) => !!val || '请选择一个']"
              />
              <q-input
                ref="stockCode"
                dense
                v-model="stockCode"
                label="代码"
                :rules="[(val) => !!val || '请填写一个']"
              />
              <q-card-actions dense align="right">
                <q-btn flat dense type="submit" label="添加" color="primary" />
              </q-card-actions>
            </form>
          </q-card>
        </q-dialog>

        <AddStock v-if="isAdd"></AddStock>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import StockTable from "src/components/StockTable.vue";
const { ipcRenderer } = window.electron;

const offset = 62 + 32;

export default {
  name: "MainLayout",
  data() {
    return {
      isAdd: false,
      basic: false,
      isTop: false,
      areaOption: [
        { label: "沪", value: "sh" },
        { label: "深", value: "sz" },
      ],
      areaCode: "",
      stockCode: "",
      timeOutId: "",
      panelsStyle: {
        height: window.innerHeight - offset + "px",
      },
      // stockList: [
      //   { areaCode: "sz", stockCode: "002174", t: "" },
      //   { areaCode: "sz", stockCode: "002751", t: "" },
      // ],
      stockList: [],
      isShowK: false,
      isOpenDevTools: false,
    };
  },
  mounted() {
    const stockList = this.$q.localStorage.getItem("stockList");
    if (stockList) {
      this.stockList = stockList;
    }
    if (this.stockList) {
      const $this = this;
      $this.each($this);
    }
  },
  methods: {
    addStock() {
      this.$q
        .dialog({
          component: "AddStock",
        })
        .onOk((stockInfo) => {
          this.$refs.stockTable.add(stockInfo);
          console.log("Add Stock Ok.", JSON.stringify(stockInfo));
        });
    },
    minimize() {
      ipcRenderer.invoke("win-mini-mize");
    },
    maximize() {
      ipcRenderer.invoke("win-max-mize");
    },
    closeApp() {
      ipcRenderer.invoke("win-close");
    },
    topApp() {
      const $this = this;
      ipcRenderer.invoke("win-top").then((e) => ($this.isTop = e));
    },
    onReset(size) {
      const height = window.innerHeight - offset;
      this.panelsStyle.height = height + "px";
    },
    openGitHub() {
      window.electron.shell.openExternal("https://github.com/GuanTu/ministock");
    },
    openDevTool() {
      const $this = this;
      ipcRenderer
        .invoke("win-auto-devtool", !$this.isOpenDevTools)
        .then(() => ($this.isOpenDevTools = !$this.isOpenDevTools));
    },
    removeStock(index) {
      this.stockList.splice(index, 1);
      this.store();
    },
    each($this) {
      if (!$this.timeOutId) {
        $this.timeOutId = setInterval(() => {
          if ($this.stockList) {
            $this.stockList.forEach((i, index) => {
              $this.doGetStockInfo($this, i, index);
            });
          }
        }, 2000);
      }
    },
    doGetStockInfo($this, stock, index) {
      const url = "/list=" + stock.areaCode + stock.stockCode;
      $this.$axios
        .get(url)
        .then((response) => {
          console.log(response);
          const data = response.data;
          if (data) {
            const itemArray = data.split('"');
            try {
              const tmp = itemArray[1].split(",");
              stock.name = tmp[0];
              stock.price = tmp[3];
              stock.increase = ((stock.price / tmp[2] - 1) * 100).toFixed(2);
              // $this.stockList[index] = stock
              $this.$set($this.stockList, index, stock);
            } catch (err) {
              console.error(err);
            }
          }
        })
        .catch(() => {
          $this.$q.notify({
            color: "negative",
            position: "top",
            message: "请求失败！",
            icon: "report_problem",
          });
        });
    },
    store() {
      const storeList = [];
      this.stockList.forEach((e) => {
        const obj = {
          areaCode: e.areaCode,
          stockCode: e.stockCode,
        };
        storeList.push(obj);
      });
      this.$q.localStorage.set("stockList", storeList);
    },
    showK(info) {
      this.isShowK = false;
      this.areaCode = info.areaCode;
      this.stockCode = info.stockCode;
      this.isShowK = true;
    },
  },
  components: { StockTable },
};
</script>
