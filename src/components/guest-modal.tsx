'use client'

import { useAtom, useSetAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { currentGuestAtom, showGuestModalAtom, addCheckedInGuestAtom, isLoadingAtom } from '@/store/atoms'
import { User, Mail, Phone, Check } from 'lucide-react'

export function GuestModal() {
  const [currentGuest] = useAtom(currentGuestAtom)
  const [showModal, setShowModal] = useAtom(showGuestModalAtom)
  const [isLoading] = useAtom(isLoadingAtom)
  const addCheckedInGuest = useSetAtom(addCheckedInGuestAtom)

  const handleCheckIn = () => {
    if (currentGuest) {
      addCheckedInGuest(currentGuest)
    }
  }

  const handleClose = () => {
    setShowModal(false)
  }

  if (!currentGuest) return null

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center text-xl font-semibold'>Thông tin khách mời</DialogTitle>
        </DialogHeader>

        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
            <Card className='space-y-4 p-6'>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <div className='rounded-full bg-blue-100 p-2'>
                    <User className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Họ và tên</p>
                    <p className='font-medium'>{currentGuest.name}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='rounded-full bg-green-100 p-2'>
                    <Mail className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Email</p>
                    <p className='font-medium'>{currentGuest.email}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='rounded-full bg-purple-100 p-2'>
                    <Phone className='h-5 w-5 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Số điện thoại</p>
                    <p className='font-medium'>{currentGuest.phone}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-3 border-t pt-4'>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleCheckIn} className='w-full bg-green-600 text-white hover:bg-green-700' disabled={isLoading}>
                    <Check className='mr-2 h-4 w-4' />
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận Check-in'}
                  </Button>
                </motion.div>

                <Button onClick={handleClose} variant='outline' className='w-full' disabled={isLoading}>
                  Hủy
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
