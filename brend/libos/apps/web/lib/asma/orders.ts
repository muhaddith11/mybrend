export * from '../createOrdersApi'
import { createOrdersApi } from '../createOrdersApi'

export const { createOrder, fetchOrders, updateOrderStatus, fetchOrdersByPhone } =
  createOrdersApi('asma')
