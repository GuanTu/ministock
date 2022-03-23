<template>
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
        <td class="text-left" :title="info.stockCode">
          {{ info.Name || "--" }}
        </td>
        <td class="text-left">{{ info.price || "--" }}</td>
        <td class="text-left">
          {{ info.increase ? info.increase + "%" : "--" }}
        </td>
        <q-menu touch-position context-menu>
          <q-btn
            flat
            dense
            v-close-popup
            label="删除"
            color="red"
            @click="removeStock(index)"
          />
          <q-btn
            flat
            dense
            v-close-popup
            label="详情"
            color="primary"
            @click="showK(info)"
          />
        </q-menu>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script>
import { push2Eastmoney } from "boot/axios";

export default {
  data() {
    return {
      timer: null,
      stockList: [],
    };
  },
  mounted() {
    const stockList = this.$q.localStorage.getItem("Mini_Stock_List");
    if (stockList) {
      this.stockList = stockList;
    }
    this.timer = setInterval(() => {
      this.refresh();
    }, 15000);
  },
  methods: {
    add(stockInfo) {
      this.stockList.push(stockInfo);
      this.restore();
    },
    removeStock(index) {
      this.stockList.splice(index, 1);
      this.restore();
    },
    refresh() {
      console.info("refresh");
      push2Eastmoney
        .get("/qt/ulist.np/get", {
          params: {
            fltt: 2,
            fields:
              "f12,f13,f19,f14,f139,f148,f2,f4,f1,f125,f18,f3,f152,f5,f30,f31,f32,f6,f8,f7,f10,f22,f9,f112,f100,f88,f153",
            secids: this.secids,
          },
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    restore() {
      // TODO 软件刚打开时，价格应该显示--
      // const storeList = [];
      // this.stockList.forEach((e) => {
      //   const obj = {
      //     areaCode: e.areaCode,
      //     stockCode: e.stockCode,
      //   };
      //   storeList.push(obj);
      // });

      this.$q.localStorage.set("Mini_Stock_List", this.stockList);
    },
  },
  computed: {
    secids: {
      get() {
        if (this.stockList.length > 0) {
          let secidArr = [];
          this.stockList.forEach((e) => {
            const secid = e.MktNum + "." + e.Code;
            secidArr.push(secid);
          });
          return secidArr.join(",");
        }
        return "";
      },
    },
  },

  beforeUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>
