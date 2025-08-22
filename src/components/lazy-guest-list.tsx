'use client'

import { memo, useMemo, useState, useCallback } from 'react'
import { Guest } from '@/lib/models/Guest'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, UserCheck, UserX } from 'lucide-react'

interface LazyGuestListProps {
  guests: Guest[]
  onToggleCheckIn: (guestId: string) => Promise<void>
  itemsPerPage?: number
  currentPage?: number
}

// Lazy loaded guest card component
const LazyGuestCard = memo(function LazyGuestCard({ guest, onToggleCheckIn }: { guest: Guest; onToggleCheckIn: (guestId: string) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleCheckIn = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await onToggleCheckIn(guest.id)
    } finally {
      setIsLoading(false)
    }
  }, [guest.id, onToggleCheckIn, isLoading])

  return (
    <Card className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              guest.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${guest.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {guest.isCheckedIn ? 'Đã check-in' : 'Chưa đến'}
          </div>

          <Button
            onClick={handleToggleCheckIn}
            disabled={isLoading}
            size='sm'
            className={`touch-target h-10 rounded-xl px-4 font-medium shadow-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
              guest.isCheckedIn ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
            }`}
          >
            {isLoading ? (
              <div className='flex items-center'>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Đang...
              </div>
            ) : guest.isCheckedIn ? (
              <>
                <UserX className='mr-1.5 h-4 w-4' />
                Check-out
              </>
            ) : (
              <>
                <UserCheck className='mr-1.5 h-4 w-4' />
                Check-in
              </>
            )}
          </Button>
        </div>

        <div className='space-y-3'>
          <h3 className='text-lg leading-snug font-semibold text-gray-900'>{guest.name || ''}</h3>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <Mail className='h-4 w-4 flex-shrink-0 text-gray-400' />
              <span className='truncate font-medium'>{guest.email || ''}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='h-4 w-4 flex-shrink-0 text-gray-400' />
              <span className='font-medium'>{guest.phone || ''}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute top-0 right-0 left-0 h-1.5 ${guest.isCheckedIn ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
    </Card>
  )
})

export const LazyGuestList = memo(function LazyGuestList({ guests, onToggleCheckIn, itemsPerPage = 20, currentPage = 0 }: LazyGuestListProps) {
  // Calculate which guests to show for the current page
  const paginatedGuests = useMemo(() => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return guests.slice(startIndex, endIndex)
  }, [guests, currentPage, itemsPerPage])

  if (guests.length === 0) {
    return (
      <Card className='rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm'>
        <div className='space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100'>
            <User className='h-8 w-8 text-gray-400' />
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-700'>Chưa có khách mời</p>
            <p className='mt-1 text-sm leading-relaxed text-gray-500'>Thêm khách mới để bắt đầu</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {paginatedGuests.map((guest) => (
        <LazyGuestCard key={guest.id} guest={guest} onToggleCheckIn={onToggleCheckIn} />
      ))}
    </div>
  )
})
