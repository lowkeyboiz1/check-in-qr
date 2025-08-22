'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, Mail, Phone, Check, X, AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react'
import { useCheckInByInfo, useToggleCheckIn } from '@/hooks/useGuests'
import confetti from 'canvas-confetti'

interface QRGuestData {
  _id?: string
  id: string
  name: string
  email: string
  phone: string
  gender?: string
  age?: string
  source?: string
  isCheckedIn: boolean
  createdAt?: string
  checkedInAt?: string
  updatedAt?: string
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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    })
  }

  const handleCheckIn = async () => {
    if (!guestData) return

    setIsProcessing(true)
    try {
      if (guestData._id) {
        // Use toggle check-in for guests with MongoDB _id
        await toggleCheckInMutation.mutateAsync(guestData.id)
      } else {
        // Use check-in by info for guests without _id
        await checkInByInfoMutation.mutateAsync({
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone
        })
      }

      triggerConfetti()

      // Close modal after successful check-in
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error during check-in:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckOut = async () => {
    if (!guestData) return

    setIsProcessing(true)
    try {
      if (guestData._id) {
        // Use toggle check-in for guests with MongoDB _id
        await toggleCheckInMutation.mutateAsync(guestData.id)
      } else {
        // For guests without _id, we'll need to use the check-in by info approach
        // But since they're already checked in, we'll need to handle this differently
        console.warn('Check-out for guests without _id not fully implemented')
      }

      // Close modal after successful check-out
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Error during check-out:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch {
      return null
    }
  }

  if (!guestData) return null

  const checkInInfo = formatDate(guestData.checkedInAt)
  const createdInfo = formatDate(guestData.createdAt)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm' onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4'
            onClick={(e) => e.stopPropagation()}
          >
            <Card className='w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl'>
              <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-blue-100 p-2'>
                      <User className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>Thông tin khách mời</h3>
                      <p className='text-sm text-gray-500'>QR Code đã quét</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {/* Status Badge */}
                <div className='flex justify-center'>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                      guestData.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${guestData.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {guestData.isCheckedIn ? 'Đã check-in' : 'Chưa check-in'}
                  </div>
                </div>

                {/* Guest Information */}
                <div className='space-y-4'>
                  {/* Name */}
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-blue-100 p-2'>
                      <User className='h-4 w-4 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500'>Họ và tên</p>
                      <p className='font-medium text-gray-900'>{guestData.name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-green-100 p-2'>
                      <Mail className='h-4 w-4 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500'>Email</p>
                      <p className='font-medium text-gray-900'>{guestData.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-purple-100 p-2'>
                      <Phone className='h-4 w-4 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500'>Số điện thoại</p>
                      <p className='font-medium text-gray-900'>{guestData.phone}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(guestData.gender || guestData.age || guestData.source) && (
                    <div className='space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                      <p className='text-sm font-medium text-gray-700'>Thông tin bổ sung</p>
                      <div className='space-y-2'>
                        {guestData.gender && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Giới tính:</span>
                            <span className='font-medium text-gray-900'>{guestData.gender}</span>
                          </div>
                        )}
                        {guestData.age && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Tuổi:</span>
                            <span className='font-medium text-gray-900'>{guestData.age}</span>
                          </div>
                        )}
                        {guestData.source && (
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Nguồn:</span>
                            <span className='font-medium text-gray-900'>{guestData.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className='space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                    <p className='text-sm font-medium text-gray-700'>Thời gian</p>
                    <div className='space-y-2'>
                      {createdInfo && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Calendar className='h-4 w-4 text-gray-400' />
                          <span className='text-gray-500'>Tạo:</span>
                          <span className='font-medium text-gray-900'>
                            {createdInfo.date} {createdInfo.time}
                          </span>
                        </div>
                      )}
                      {guestData.isCheckedIn && checkInInfo && (
                        <div className='flex items-center gap-2 text-sm'>
                          <CheckCircle className='h-4 w-4 text-emerald-500' />
                          <span className='text-gray-500'>Check-in:</span>
                          <span className='font-medium text-gray-900'>
                            {checkInInfo.date} {checkInInfo.time}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='space-y-3'>
                  {guestData.isCheckedIn ? (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button onClick={handleCheckOut} disabled={isProcessing} className='w-full bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-70'>
                        {isProcessing ? (
                          <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                            Đang xử lý...
                          </div>
                        ) : (
                          <div className='flex items-center'>
                            <X className='mr-2 h-4 w-4' />
                            Check-out
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button onClick={handleCheckIn} disabled={isProcessing} className='w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-70'>
                        {isProcessing ? (
                          <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                            Đang check-in...
                          </div>
                        ) : (
                          <div className='flex items-center'>
                            <Check className='mr-2 h-4 w-4' />
                            Check-in ngay
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  <Button onClick={onClose} variant='outline' className='w-full' disabled={isProcessing}>
                    Đóng
                  </Button>
                </div>

                {/* Success/Error Messages */}
                {checkInByInfoMutation.isError && (
                  <div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-500' />
                      <div>
                        <p className='font-medium text-red-800'>Lỗi check-in</p>
                        <p className='mt-1 text-sm text-red-700'>{checkInByInfoMutation.error?.message || 'Có lỗi xảy ra khi check-in'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {toggleCheckInMutation.isError && (
                  <div className='rounded-2xl border border-red-200 bg-red-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-500' />
                      <div>
                        <p className='font-medium text-red-800'>Lỗi xử lý</p>
                        <p className='mt-1 text-sm text-red-700'>{toggleCheckInMutation.error?.message || 'Có lỗi xảy ra'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {checkInByInfoMutation.isSuccess && (
                  <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500' />
                      <div>
                        <p className='font-medium text-emerald-800'>Thành công!</p>
                        <p className='mt-1 text-sm text-emerald-700'>{checkInByInfoMutation.data?.message || 'Check-in thành công'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {toggleCheckInMutation.isSuccess && (
                  <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500' />
                      <div>
                        <p className='font-medium text-emerald-800'>Thành công!</p>
                        <p className='mt-1 text-sm text-emerald-700'>Cập nhật trạng thái thành công</p>
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
