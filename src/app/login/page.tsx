'use client'

import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { isAuthenticatedAtom, showSecurityModalAtom, loginAttemptsAtom } from '@/store/atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SecurityModal } from '@/components/security-modal'
import { toast } from 'sonner'

const CORRECT_USERNAME = 'toihanhphuc'
const CORRECT_PASSWORD = 'weloveyou'

interface LoginFormData {
  username: string
  password: string
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
  const [showSecurityModal, setShowSecurityModal] = useAtom(showSecurityModalAtom)
  const [loginAttempts, setLoginAttempts] = useAtom(loginAttemptsAtom)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: ''
    }
  })

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      router.push('/')
    }
  }, [setIsAuthenticated, router])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Check if username and password are correct
      if (data.username === CORRECT_USERNAME && data.password === CORRECT_PASSWORD) {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        // If this is the 3rd attempt (or more), allow login
        if (newAttempts >= 3) {
          // Show security modal instead of direct login
          setShowSecurityModal(true)
          toast.success('Đăng nhập thành công! Vui lòng trả lời câu hỏi bảo mật.')
        } else {
          // Show error for first 2 attempts
          toast.error('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.')
          setValue('password', '')
        }
      } else {
        // Wrong credentials
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        if (newAttempts >= 3) {
          toast.error('Bạn đã thử quá nhiều lần! Vui lòng thử lại.')
        } else {
          toast.error('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full max-w-sm'>
        <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='mb-6 text-center'>
            <h1 className='text-2xl font-semibold text-gray-900'>Đăng nhập</h1>
            <p className='mt-1 text-sm text-gray-600'>Nhập thông tin để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Input type='text' placeholder='Tên đăng nhập' {...register('username', { required: true })} className='h-11 w-full' />
            </div>

            <div>
              <Input type='password' placeholder='Mật khẩu' {...register('password', { required: true })} className='h-11 w-full' />
            </div>

            <Button type='submit' className='h-11 w-full bg-blue-600 hover:bg-blue-700' disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Security Modal */}
      <SecurityModal />
    </div>
  )
}
