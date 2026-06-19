import { createProductsApi } from '../createProductsApi'

export const { fetchProducts, createProduct, updateProduct, deleteProduct } =
  createProductsApi('boosner')
