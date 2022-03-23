import AddStock from "components/AddStock.vue";
import StockTable from "components/StockTable";

export default async ({ app }) => {
  app.component("AddStock", AddStock);
  app.component("StockTable", StockTable);
};
