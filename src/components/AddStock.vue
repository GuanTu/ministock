<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-md row items-start">
            <!--input-debounce="0"  -->
            <q-select
              outlined
              map-options
              hide-selected
              use-input
              fill-input
              v-model="stockInfo"
              option-label="Name"
              :options="stockList"
              @filter="filterFn"
              @filter-abort="abortFilterFn"
              hint="输入股票名称或代码，最少输入2个字符触发搜索"
              style="width: 250px; padding-bottom: 32px"
              autocomplete="false"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    未搜索到结果
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" label="确定" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { searchapi } from "boot/axios";

export default {
  name: "AddStock",
  props: {
    // ...your custom props
  },

  emits: [
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    "ok",
    "hide",
  ],

  data() {
    return {
      stockInfo: {
        Name: "",
        SecurityType: "",
        Code: "",
      },
      stockCode: null,
      stockList: [],

      // other methods that we used in our vue html template;
      // these are part of our example (so not required)
    };
  },

  methods: {
    filterFn(val, update, abort) {
      if (val.length < 2) {
        abort();
        return;
      }
      const $this = this;
      update(() => {
        // const needle = val.toLowerCase();
        // options.value = stringOptions.filter(
        //   (v) => v.toLowerCase().indexOf(needle) > -1
        // );
        this.search(val);
      });
    },
    abortFilterFn() {
      console.log("delayed filter aborted");
    },

    search(val) {
      // https://searchapi.eastmoney.com/api/Info/Search?appid=el1902262&type=14&token=CCSDCZSDCXYMYZYYSYYXSMDDSMDHHDJT&and14=MultiMatch/Name,Code,PinYin/$keyword/true
      //&returnfields14=Name,Code,PinYin,MarketType,JYS,MktNum,JYS4App,MktNum4App,ID,Classify,IsExactMatch,SecurityType,SecurityTypeName&pageIndex14=1&pageSize14=10
      //&isAssociation14=false$timestamp
      const $this = this;
      searchapi
        .get("/Info/Search", {
          params: {
            appid: "el1902262",
            type: 14,
            token: "CCSDCZSDCXYMYZYYSYYXSMDDSMDHHDJT",
            and14: "MultiMatch/Name,Code,PinYin/" + val + "/true",
            returnfields14:
              "Name,Code,PinYin,MarketType,JYS,MktNum,JYS4App,MktNum4App,ID,Classify,IsExactMatch,SecurityType,SecurityTypeName",
            pageIndex14: 1,
            pageSize14: 10,
            isAssociation14: "false" + Date.now(),
          },
        })
        .then(function (response) {
          // $this.stockList.splice(0);
          // $this.stockList.push();
          if (response.data.Data) {
            $this.stockList = response.data.Data;
          } else {
            $this.stockList = [];
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    onOKClick() {
      if (!this.stockInfo.SecurityType) {
        this.hide();
        return;
      }
      if ("1" === this.stockInfo.SecurityType) {
        this.stockCode = "sh" + this.stockInfo.Code;
      } else if ("2" === this.stockInfo.SecurityType) {
        this.stockCode = "sz" + this.stockInfo.Code;
      } else {
        this.$q.notify({
          type: "warning",
          message: "目前只支持添加沪深A股",
        });
        this.stockInfo = null;
        return;
      }
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok", this.stockCode);
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide the dialog
      this.hide();
    },
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit("hide");
    },
  },
};
</script>
