import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios
if (process.env.DEV) {
  axios.defaults.baseURL = '/api'
} else {
  axios.defaults.baseURL = 'http://hq.sinajs.cn'
}
