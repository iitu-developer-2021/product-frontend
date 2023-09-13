export type Product = {
  id: number
  imageId?: number
  typeId: number
  name: string
  wholesalePrice: string
  retailPrice: string
  price: string
  isWeightProduct: boolean
}

export type Response<T> = {
  message: string
  status: boolean
  result: T
}
