export type Product = {
  id: number
  typesId: number
  name: string
  wholesalePrice: number
  retailPrice: number
  price: number
  isWeightProduct: boolean
  count: number
  barcode?: string
  createdAt?: string
  updatedAt?: string
}

export type Sell = {
  id: number
  name: string
  sellPrice: number
  productPrice: number
  count: number
  typeName: string
  isWeightProduct: boolean
  isManual: boolean
  createdAt?: string
  updatedAt?: string
  remainedCount?: number
  barcode?: string
  productId: number | null
}

export type Type = {
  id: number
  name: string
}

export type ClientSell = {
  id: number
  name: string
  sells?: Sell[]
  totalPrice: number
  createdAt?: string
  updatedAt?: string
}

export type Response<T> = {
  message: string
  status: boolean
  result: T
}
