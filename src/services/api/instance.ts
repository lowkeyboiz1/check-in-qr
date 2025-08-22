'use client'

import axios from 'axios'
import { toast } from 'sonner'

export const authHeader_Bearer = () => {
  if (typeof window === 'undefined') return {}

  // Get token from cookies if needed
  // const token = localStorage.getItem('token')
  // return token ? { Authorization: `Bearer ${token}` } : {}
  return {}
}

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(
  async (config: any) => {
    const authHeader = authHeader_Bearer()
    config.headers = {
      ...config.headers,
      ...authHeader
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor for handling success and errors with toast notifications
instance.interceptors.response.use(
  (response) => {
    // Show success toast for successful requests (optional - can be customized)
    const method = response.config.method?.toUpperCase()
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')

    if (isWriteOperation) {
      const successMessage = response.data?.message || 'Thao tác thành công!'
      toast.success(successMessage)
    }

    return response
  },
  async (error) => {
    // Handle 401 unauthorized
    if (error?.response?.status === 401) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
      // Redirect to login if needed
      // window.location.href = '/'
    }

    // Show error toast
    if (error.response) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
      toast.error(errorMessage)

      return Promise.reject({
        status: error.response.status,
        message: error.response.data.message
      })
    } else if (error.request) {
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!')
      return Promise.reject(error.request)
    } else {
      toast.error('Có lỗi không xác định xảy ra!')
      return Promise.reject(error)
    }
  }
)
