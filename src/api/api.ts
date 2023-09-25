import axios from 'axios'
// @ts-ignore
import { withAbort } from './helpers/withAbort.ts'
// @ts-ignore
import { config } from '../config'
import type { AxiosInstance } from 'axios'
import router from '../router'

const axiosInstance = axios.create({
  baseURL: config.BACKEND_URL,
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token')
  }
})

type AxiosInstanceWrapper = Pick<AxiosInstance, 'get' | 'post' | 'put' | 'delete'>

const createApi = (axios: AxiosInstance): AxiosInstanceWrapper => {
  return {
    get: (url, config) => withAbort(axios.get)(url, config),
    post: (url, data, config) => withAbort(axios.post)(url, data, config),
    put: (url, data, config) => withAbort(axios.put)(url, data, config),
    delete: (url, config) => withAbort(axios.delete)(url, config)
  }
}

axiosInstance.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token') || ''
  config.headers.Authorization = 'Bearer ' + token

  return config
})

axiosInstance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response.status === 403) {
      localStorage.removeItem('token')
      router.push({
        name: 'Login'
      })
    } else {
      return Promise.reject(error)
    }
  }
)

export default createApi(axiosInstance)
