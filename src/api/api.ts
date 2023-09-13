import axios from 'axios'
// @ts-ignore
import { withAbort } from './helpers/withAbort.ts'
// @ts-ignore
import { config } from '../config'
import type { AxiosInstance } from 'axios'

const axiosInstance = axios.create({
  baseURL: config.BACKEND_URL
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

export default createApi(axiosInstance)
