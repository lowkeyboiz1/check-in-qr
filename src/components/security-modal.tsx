'use client'

import { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { showSecurityModalAtom, isAuthenticatedAtom, loginAttemptsAtom } from '@/store/atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'

const CORRECT_ANSWER = '1943'

export function SecurityModal() {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useAtom(showSecurityModalAtom)
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
  const [loginAttempts, setLoginAttempts] = useAtom(loginAttemptsAtom)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSecurityCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    try {
      const enteredOtp = otp.join('')
      console.log({ enteredOtp })
      if (enteredOtp === CORRECT_ANSWER) {
        // Successful authentication
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')

        // Reset login attempts
        setLoginAttempts(0)

        setShowSecurityModal(false)
        toast.success('Đăng nhập thành công! Chào mừng bạn!')
        router.push('/')
      } else {
        // Wrong answer
        toast.error('Câu trả lời không đúng. Vui lòng thử lại.')
        setOtp(['', '', '', ''])
        // Focus back to first input
        const firstInput = document.getElementById('otp-0')
        firstInput?.focus()
      }
    } catch (error) {
      console.error('Security check error:', error)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShowSecurityModal(false)
    setOtp(['', '', '', ''])
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus to next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto submit when 4th digit is entered
    if (value && index === 3) {
      const completeOtp = [...newOtp]
      completeOtp[index] = value

      // Delay submission slightly to allow state update
      setTimeout(() => {
        const finalOtp = completeOtp.join('')
        console.log({ finalOtp, completeOtp })
        if (finalOtp === CORRECT_ANSWER) {
          // Successful authentication
          setIsAuthenticated(true)
          localStorage.setItem('isAuthenticated', 'true')

          // Reset login attempts
          setLoginAttempts(0)

          setShowSecurityModal(false)
          toast.success('Đăng nhập thành công! Chào mừng bạn!')
          router.push('/')
        } else {
          // Wrong answer
          toast.error('Câu trả lời không đúng. Vui lòng thử lại.')
          setOtp(['', '', '', ''])
          // Focus back to first input
          const firstInput = document.getElementById('otp-0')
          firstInput?.focus()
        }
      }, 100)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  if (!showSecurityModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className='w-full max-w-md'
          onClick={(e) => e.stopPropagation()}
        >
          <Card className='overflow-hidden border-0 shadow-2xl'>
            {/* Header with gradient */}
            <div className='bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 px-6 py-6 text-white'>
              <div className='mb-2 flex items-center justify-center gap-2'>
                <Heart className='h-6 w-6 text-pink-100' />
                <Heart className='h-4 w-4 animate-pulse text-pink-200' />
              </div>
              <CardTitle className='text-center text-2xl font-bold text-white'>Câu hỏi tình cảm</CardTitle>
              <CardDescription className='mt-2 text-center text-pink-100'>Khi nghĩ về Mẹ anh chị em nghĩ đến số bao nhiêu?</CardDescription>
            </div>

            <CardContent className='bg-gradient-to-b from-white to-gray-50 p-6'>
              <form ref={formRef} onSubmit={handleSecurityCheck} className='space-y-6'>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <p className='mb-4 text-sm font-medium text-gray-700'>Nhập 4 chữ số để tiếp tục</p>
                    <div className='flex justify-center gap-3'>
                      {otp.map((digit, index) => (
                        <motion.div key={index} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }}>
                          <Input
                            id={`otp-${index}`}
                            type='text'
                            inputMode='numeric'
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className='h-14 w-14 rounded-xl border-2 text-center text-2xl font-bold transition-all duration-200 focus:scale-105 focus:border-pink-500 focus:ring-2 focus:ring-pink-200'
                            autoFocus={index === 0}
                            required
                            disabled={isLoading}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
                      <div className='inline-flex items-center gap-2 text-pink-600'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-pink-600 border-t-transparent' />
                        <span className='text-sm font-medium'>Đang kiểm tra...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className='flex gap-3'>
                  <Button type='button' variant='outline' onClick={handleClose} className='flex-1 rounded-xl border-gray-300 hover:bg-gray-50' disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button
                    type='submit'
                    className='flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-red-600 hover:shadow-xl'
                    disabled={isLoading || otp.join('').length < 4}
                  >
                    {isLoading ? (
                      <div className='flex items-center gap-2'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Kiểm tra...
                      </div>
                    ) : (
                      'Xác nhận'
                    )}
                  </Button>
                </div>
              </form>

              {/* Hint */}
              <div className='mt-4 text-center'>
                <p className='flex items-center justify-center gap-1 text-xs text-gray-500'>
                  <Heart className='h-3 w-3 text-pink-400' />
                  Hãy nghĩ về những kỷ niệm đẹp nhất
                  <Heart className='h-3 w-3 text-pink-400' />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
