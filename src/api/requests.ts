import axios from './api'
//@ts-ignore
import type { Product, Response, Type } from '../../types/index.ts'

const URLS = {
  getProducts: '/products',
  createProducts: '/products',
  deleteProducts: '/products',
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
  name: string,
  wholesalePrice: string,
  retailPrice: string,
  price: string,
  isWeightProduct: boolean,
  typesId: number
): Promise<Response<{ product: Product }>> =>
  axios
    .post(
      URLS.createProducts,
      { name, wholesalePrice, retailPrice, price, isWeightProduct, typesId },
      {}
    )
    .then((response) => response.data)

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
  totalPrice,
  typeName,
  isWeightProduct,
  clientSellsId
}: {
  name: string
  sellPrice: string
  productPrice: string
  count: string
  totalPrice: string
  typeName: string
  isWeightProduct: boolean
  clientSellsId: number
}) =>
  axios
    .post(
      URLS.createSell,
      {
        name,
        sellPrice,
        productPrice,
        count,
        totalPrice,
        typeName,
        isWeightProduct,
        clientSellsId
      },
      {}
    )
    .then((response) => response.data)
