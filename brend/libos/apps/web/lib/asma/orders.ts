export * from '../createOrdersApi'
import { createOrdersApi } from '../createOrdersApi'

export const { createOrder, fetchOrderById, fetchMyOrders, fetchOrders, updateOrderStatus, fetchOrdersByPhone } =
  createOrdersApi('asma')
