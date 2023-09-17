export type Product = {
  id: number
  imageId?: number
  typesId: number
  name: string
  wholesalePrice: string
  retailPrice: string
  price: string
  isWeightProduct: boolean
  createdAt?: string
  updatedAt?: string
}

export type Sell = {
  id: number
  name: string
  sellPrice: string
  productPrice: string
  count: number
  totalPrice: string
  typeName: string
  isWeightProduct: boolean
  isManual: boolean
  createdAt?: string
  updatedAt?: string
  manualWeightProduct?: boolean
}

export type ClientSell = {
  id: number
  name: string
  sells?: Sell[]
  createdAt?: string
  updatedAt?: string
}

export type Response<T> = {
  message: string
  status: boolean
  result: T
}

export type Type = {
  id: number
  name: string
}
