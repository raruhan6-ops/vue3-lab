import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useToast } from '@/composables/useToast'

NProgress.configure({ showSpinner: false })
const http = axios.create()

http.interceptors.request.use((cfg)=>{ NProgress.start(); return cfg })
http.interceptors.response.use(
  res => { NProgress.done(); return res },
  err => {
    NProgress.done()
    const { show } = useToast()
    show(err?.response?.data?.message || '网络错误', 'error', 2600)
    return Promise.reject(err)
  }
)

export default http
