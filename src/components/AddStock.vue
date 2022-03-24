<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="q-pa-md">
          <div class="q-gutter-md row">
            <q-select
              outlined
              map-options
              hide-selected
              use-input
              fill-input
              input-debounce="600"
              v-model="stockInfo"
              option-label="Name"
              :options="stockList"
              @filter="filterFn"
              @filter-abort="abortFilterFn"
              label="输入股票名称或代码"
              autocomplete="false"
              options-dense
              bottom-slots
              class="fit"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>{{ scope.opt.Code }} </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.Name }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      scope.opt.SecurityTypeName
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    未搜索到结果
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:after>
                <q-btn round dense flat icon="done" @click="onOKClick" />
              </template>
              <template v-slot:hint>
                <div style="width: 280px">
                  1.最少输入2个字符触发搜索<br />
                  2.若感觉有问题可以点击输入框触发搜索
                </div>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
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
      if (!this.stockInfo || !this.stockInfo.SecurityType) {
        this.$q.notify({
          position: "center",
          type: "warning",
          message: "请选中你想要的股票再提交",
          timeout: 2000,
        });
        return;
      }

      if (
        "1" !== this.stockInfo.SecurityType &&
        "2" !== this.stockInfo.SecurityType
      ) {
        this.$q.notify({
          position: "center",
          type: "warning",
          message: "目前只支持添加沪深A股",
          timeout: 2000,
        });
        this.stockInfo = {};
        return;
      }
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit("ok", this.stockInfo);
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
