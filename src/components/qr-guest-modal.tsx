'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, Mail, Phone, Check, X, AlertCircle } from 'lucide-react'
import { useCheckInByInfo, useToggleCheckIn } from '@/hooks/useGuests'
import confetti from 'canvas-confetti'

interface QRGuestData {
  _id?: string
  id: string
  name: string
  email: string
  phone: string
  isCheckedIn: boolean
}

interface QRGuestModalProps {
  guestData: QRGuestData | null
  onClose: () => void
  isOpen: boolean
}

export function QRGuestModal({ guestData, onClose, isOpen }: QRGuestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const checkInByInfoMutation = useCheckInByInfo()
  const toggleCheckInMutation = useToggleCheckIn()

  const handleAction = async () => {
    if (!guestData) return

    setIsProcessing(true)
    try {
      if (guestData._id) {
        await toggleCheckInMutation.mutateAsync(guestData.id)
      } else {
        await checkInByInfoMutation.mutateAsync({
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone
        })
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      setTimeout(() => onClose(), 1500)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!guestData) return null

  const hasError = checkInByInfoMutation.isError || toggleCheckInMutation.isError
  const errorMessage = checkInByInfoMutation.error?.message || toggleCheckInMutation.error?.message

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4'
            onClick={(e) => e.stopPropagation()}
          >
            <Card className='rounded-3xl bg-white p-6 shadow-2xl'>
              <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Thông tin khách mời</h3>
                  <Button variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 rounded-full p-0'>
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {/* Status */}
                <div className='flex justify-center'>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${guestData.isCheckedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    <div className={`h-2 w-2 rounded-full ${guestData.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {guestData.isCheckedIn ? 'Đã check-in' : 'Chưa check-in'}
                  </div>
                </div>

                {/* Info */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-blue-100 p-2'>
                      <User className='h-4 w-4 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Họ và tên</p>
                      <p className='font-medium'>{guestData.name}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-green-100 p-2'>
                      <Mail className='h-4 w-4 text-green-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Email</p>
                      <p className='font-medium'>{guestData.email}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-purple-100 p-2'>
                      <Phone className='h-4 w-4 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Số điện thoại</p>
                      <p className='font-medium'>{guestData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='space-y-3'>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleAction} disabled={isProcessing} className={`w-full ${guestData.isCheckedIn ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                      {isProcessing ? (
                        <div className='flex items-center'>
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          Đang xử lý...
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          {guestData.isCheckedIn ? <X className='mr-2 h-4 w-4' /> : <Check className='mr-2 h-4 w-4' />}
                          {guestData.isCheckedIn ? 'Check-out' : 'Check-in'}
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  <Button onClick={onClose} variant='outline' className='w-full' disabled={isProcessing}>
                    Đóng
                  </Button>
                </div>

                {/* Error */}
                {hasError && (
                  <div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-500' />
                      <div>
                        <p className='font-medium text-red-800'>Có lỗi xảy ra</p>
                        <p className='mt-1 text-sm text-red-700'>{errorMessage || 'Vui lòng thử lại'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
