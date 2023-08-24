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
          icon="push_pin"
          @click="topApp"
          :color="isTop ? 'red' : ''"
        />
        <q-btn dense flat icon="minimize" @click="minimize" />
        <!-- <q-btn dense flat icon="crop_square" @click="maximize" /> -->
        <q-btn dense flat icon="star" @click="openGitHub" />
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
  components: { StockTable },
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
  mounted() {},
  methods: {
    addStock() {
      this.maximize();
      this.$q
        .dialog({
          component: "AddStock",
        })
        .onOk((stockInfo) => {
          this.$refs.stockTable.add(stockInfo);
          console.log("Add Stock Ok.", JSON.stringify(stockInfo));
          this.maximize();
        })
        .onCancel(() => {
          this.maximize();
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
      ipcRenderer.invoke("open-github");
    },
    openDevTool() {
      const $this = this;
      ipcRenderer
        .invoke("win-auto-devtool", !$this.isOpenDevTools)
        .then(() => ($this.isOpenDevTools = !$this.isOpenDevTools));
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
  },
};
</script>
