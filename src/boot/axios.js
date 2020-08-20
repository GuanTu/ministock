import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios
// axios.defaults.baseURL = '/api'
axios.defaults.baseURL = 'http://hq.sinajs.cn'
