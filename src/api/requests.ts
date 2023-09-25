import axios from './api'
//@ts-ignore
import type { Product, Response, Type } from '../../types/index.ts'

const URLS = {
  getProducts: '/products',
  createProducts: '/products',
  deleteProducts: '/products',
  editProducts: '/products',
  getTypes: '/types',
  createTypes: '/types',
  editType: '/types',
  deleteType: '/types',
  createClientSells: '/clientSells',
  deleteClientSells: '/clientSells',
  getClientSells: '/clientSells',
  createSell: '/sells',
  login: '/login'
}

export const fetchProducts = (): Promise<Response<{ products: Product[] }>> =>
  axios.get(URLS.getProducts, {}).then((response) => response.data)

export const createProduct = (
  product: Omit<Product, 'id'>
): Promise<Response<{ product: Product }>> =>
  axios.post(URLS.createProducts, product, {}).then((response) => response.data)

export const editProduct = (product: Product): Promise<Response<{ product: Product }>> =>
  axios.put(URLS.editProducts, product, {}).then((response) => response.data)

export const deleteProduct = (id: number): Promise<Response<{ productId: number }>> =>
  axios.delete(URLS.deleteProducts + '/' + id, {}).then((response) => response.data)

export const fetchTypes = (): Promise<Response<Type[]>> =>
  axios.get(URLS.getTypes, {}).then((response) => response.data)

export const createTypes = (name: string): Promise<Response<{ type: Type }>> =>
  axios.post(URLS.createTypes, { name }, {}).then((response) => response.data)

export const editTypes = (id: number, name: string): Promise<Response<{ type: Type }>> =>
  axios.put(URLS.editType, { typeId: id, name }, {}).then((response) => response.data)

export const deleteTypes = (id: number): Promise<Response<{ type: number }>> =>
  axios.delete(URLS.editType + '/' + id, {}).then((response) => response.data)

export const createClientSell = (
  name: string,
  totalPrice: string
): Promise<Response<{ clientSell: { id: number; name: string } }>> =>
  axios.post(URLS.createClientSells, { name, totalPrice }, {}).then((response) => response.data)

export const getClientSells = () =>
  axios.get(URLS.getClientSells, {}).then((response) => response.data)

export const deleteClientSell = (id: number): Promise<Response<{ clientSellId: number }>> =>
  axios.delete(URLS.deleteClientSells + '/' + id, {}).then((response) => response.data)

export const signIn = (login: string, password: string): Promise<Response<{ token: string }>> =>
  axios.post(URLS.login, { login, password }, {}).then((response) => response.data)

export const createSell = ({
  name,
  sellPrice,
  productPrice,
  count,
  typeName,
  isWeightProduct,
  clientSellsId,
  barcode,
  productId
}: {
  name: string
  sellPrice: number
  productPrice: number
  count: number
  typeName: string
  isWeightProduct: boolean
  clientSellsId: number
  barcode: string
  productId: number | null
}) =>
  axios
    .post(
      URLS.createSell,
      {
        name,
        sellPrice,
        productPrice,
        count,
        typeName,
        isWeightProduct,
        clientSellsId,
        barcode,
        productId
      },
      {}
    )
    .then((response) => response.data)
