'use client'

import { useAtom, useSetAtom } from 'jotai'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showAddGuestModalAtom, addGuestAtom, isLoadingAtom, newlyAddedGuestAtom, showNewGuestAddedModalAtom, Guest } from '@/store/atoms'
import { guestFormSchema, type GuestFormData } from '@/lib/validations'
import { User, Mail, Phone, Plus, X } from 'lucide-react'

export function AddGuestModal({ onAddGuest }: { onAddGuest?: (guest: Omit<Guest, 'id' | 'createdAt' | 'isCheckedIn'>) => void }) {
  const [showModal, setShowModal] = useAtom(showAddGuestModalAtom)
  const [isLoading] = useAtom(isLoadingAtom)
  const addGuest = useSetAtom(addGuestAtom)

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

  const onSubmit = (data: GuestFormData) => {
    const guestData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim()
    }

    // Use custom callback if provided (for mock mode), otherwise use atom
    if (onAddGuest) {
      onAddGuest(guestData)
    } else {
      addGuest(guestData)
    }

    // Reset form and close modal
    reset()
    setShowModal(false)
  }

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

              {/* Action Buttons */}
              <div className='space-y-3 border-t pt-4'>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button type='submit' className='w-full bg-blue-600 text-white hover:bg-blue-700' disabled={isLoading || !isValid}>
                    <Plus className='mr-2 h-4 w-4' />
                    {isLoading ? 'Đang thêm...' : 'Thêm khách'}
                  </Button>
                </motion.div>

                <Button type='button' onClick={handleClose} variant='outline' className='w-full' disabled={isLoading}>
                  <X className='mr-2 h-4 w-4' />
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
