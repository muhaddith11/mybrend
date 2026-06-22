export * from '../createOrdersApi'
import { createOrdersApi } from '../createOrdersApi'

export const { createOrder, fetchOrderById, fetchOrders, updateOrderStatus, fetchOrdersByPhone } =
  createOrdersApi('boosner')
