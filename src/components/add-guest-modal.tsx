'use client'

import { useAtom } from 'jotai'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showAddGuestModalAtom, showNewGuestAddedModalAtom } from '@/store/atoms'
import { guestFormSchema, type GuestFormData } from '@/lib/validations'
import { User, Mail, Phone, Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import { FloatingAnimation } from '@/components/floating-animation'
import { useAddGuest } from '@/hooks/useGuests'
import { CreateGuestData } from '@/lib/models/Guest'
import { useEffect } from 'react'

export function AddGuestModal({ onAddGuest }: { onAddGuest?: (guest: CreateGuestData) => void }) {
  const [showModal, setShowModal] = useAtom(showAddGuestModalAtom)
  const [, setShowNewGuestAddedModal] = useAtom(showNewGuestAddedModalAtom)
  const addGuestMutation = useAddGuest()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    mode: 'onChange', // Real-time validation
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  })

  const onSubmit = async (data: GuestFormData) => {
    const guestData: CreateGuestData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim()
    }

    // Use custom callback if provided (for mock mode)
    if (onAddGuest) {
      onAddGuest(guestData)
      reset()
      setShowModal(false)
      return
    }

    // Use React Query mutation
    try {
      await addGuestMutation.mutateAsync(guestData)

      // Show success notification
      setShowNewGuestAddedModal(true)

      // Reset form and close modal
      reset()
      setShowModal(false)
    } catch (error) {
      // Error handling is managed by React Query
      console.error('Failed to add guest:', error)
    }
  }

  // Show success notification when guest is added successfully
  useEffect(() => {
    if (addGuestMutation.isSuccess) {
      setShowNewGuestAddedModal(true)
    }
  }, [addGuestMutation.isSuccess, setShowNewGuestAddedModal])

  const handleClose = () => {
    reset()
    setShowModal(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-center gap-2 text-center text-xl font-semibold'>
            <Plus className='h-5 w-5 text-blue-600' />
            Thêm khách mới
          </DialogTitle>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
          <Card className='space-y-4 p-6'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* Name Field */}
              <Input {...register('name')} type='text' label='Họ và tên' icon={<User className='h-4 w-4' />} placeholder='Nhập họ và tên...' error={errors.name} required />

              {/* Email Field */}
              <Input {...register('email')} type='email' label='Email' icon={<Mail className='h-4 w-4' />} placeholder='Nhập địa chỉ email...' error={errors.email} required />

              {/* Phone Field */}
              <Input {...register('phone')} type='tel' label='Số điện thoại' icon={<Phone className='h-4 w-4' />} placeholder='Nhập số điện thoại...' error={errors.phone} required />

              {/* Error Message */}
              {addGuestMutation.isError && (
                <div className='flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm'>{addGuestMutation.error instanceof Error ? addGuestMutation.error.message : 'Đã có lỗi xảy ra khi thêm khách mời'}</span>
                </div>
              )}

              {/* Success Message */}
              {addGuestMutation.isSuccess && (
                <div className='flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700'>
                  <CheckCircle className='h-4 w-4 flex-shrink-0' />
                  <span className='text-sm'>Thêm khách mời thành công!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2 border-t pt-4'>
                <Button type='button' onClick={handleClose} variant='outline' className='flex-1' disabled={addGuestMutation.isPending}>
                  <X className='mr-2 h-4 w-4' />
                  Hủy
                </Button>
                {/* Add Only Button */}
                <motion.div whileTap={{ scale: 0.98 }} className='flex-1'>
                  <Button type='submit' variant='outline' className='w-full border-blue-600 text-blue-600 hover:bg-blue-50' disabled={addGuestMutation.isPending || !isValid}>
                    {addGuestMutation.isPending ? (
                      <>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Plus className='mr-2 h-4 w-4' />
                        Thêm khách
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </Card>
        </motion.div>
      </DialogContent>

      {/* Floating Animation */}
      <FloatingAnimation />
    </Dialog>
  )
}
