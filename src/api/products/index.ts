import axios from '../api'
//@ts-ignore
import type { Product, Response } from '../../types/index.ts'

const URLS = {
  getProducts: '/products'
}

export const fetchProducts = () =>
  axios
    .get<Response<{ products: Product[] }>>(URLS.getProducts, {})
    .then((response) => response.data)
