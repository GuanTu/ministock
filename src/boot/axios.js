import { boot } from "quasar/wrappers";
import axios from "axios";

let searchapiurl = "";
if (process.env.DEV) {
  searchapiurl = "/searchapi";
} else {
  searchapiurl = "https://searchapi.eastmoney.com/api";
}

let push2EastmoneyUrl = "";
if (process.env.DEV) {
  push2EastmoneyUrl = "/push2Eastmoney";
} else {
  push2EastmoneyUrl = "https://push2.eastmoney.com/api";
}

const searchapi = axios.create({
  baseURL: searchapiurl,
  withCredentials: false, // default
  headers: {
    // Host: "searchapi.eastmoney.com",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    // Origin: "searchapi.eastmoney.com",
    // Referer: "searchapi.eastmoney.com",
    // "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Origin, Content-Type, X-Auth-Token, Referrer-Policy",
    // "sec-ch-ua":' Not A;Brand";v="99", "Chromium";v="99", "Microsoft Edge";v="99"',
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": "Windows",
  },
});

const push2Eastmoney = axios.create({
  baseURL: push2EastmoneyUrl,
  withCredentials: false, // default
  headers: {
    // Host: "searchapi.eastmoney.com",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    // Origin: "searchapi.eastmoney.com",
    // Referer: "searchapi.eastmoney.com",
    // "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Origin, Content-Type, X-Auth-Token, Referrer-Policy",
    // "sec-ch-ua":' Not A;Brand";v="99", "Chromium";v="99", "Microsoft Edge";v="99"',
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": "Windows",
  },
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$searchapi = searchapi;
  app.config.globalProperties.$push2Eastmoney = push2Eastmoney;
});

export { axios, searchapi, push2Eastmoney };
