'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSetAtom } from 'jotai'
import { setCurrentGuestAtom } from '@/store/atoms'
import type { Guest } from '@/store/atoms'
import { User, Gift } from 'lucide-react'

export function DemoQRGenerator() {
  const [isVisible, setIsVisible] = useState(false)
  const setCurrentGuest = useSetAtom(setCurrentGuestAtom)

  const sampleGuests: Omit<Guest, 'id'>[] = [
    {
      name: 'Nguyễn Văn Nam',
      email: 'nguyenvannam@email.com',
      phone: '0901234567',
      isCheckedIn: false,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Trần Thị Lan',
      email: 'tranthilan@email.com',
      phone: '0987654321',
      isCheckedIn: false,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Lê Minh Tuấn',
      email: 'leminhtuan@email.com',
      phone: '0912345678',
      isCheckedIn: false,
      createdAt: new Date().toISOString()
    },
    {
      name: 'Phạm Thị Hoa',
      email: 'phamthihoa@email.com',
      phone: '0923456789',
      isCheckedIn: false,
      createdAt: new Date().toISOString()
    }
  ]

  const simulateQRScan = (guestData: Omit<Guest, 'id'>) => {
    const guest: Guest = {
      ...guestData,
      id: Date.now().toString()
    }
    setCurrentGuest(guest)
  }

  if (!isVisible) {
    return (
      <div className='fixed right-4 bottom-24 z-50'>
        <Button onClick={() => setIsVisible(true)} variant='outline' size='sm' className='border-2 border-dashed border-blue-300 bg-white text-blue-600 shadow-lg hover:bg-blue-50'>
          <Gift className='mr-2 h-4 w-4' />
          Demo QR
        </Button>
      </div>
    )
  }

  return (
    <div className='fixed right-4 bottom-24 z-50'>
      <Card className='w-64 border-blue-200 bg-white p-4 shadow-xl'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-blue-700'>Demo QR Scan</h3>
          <Button onClick={() => setIsVisible(false)} variant='ghost' size='sm' className='h-6 w-6 p-0'>
            ×
          </Button>
        </div>

        <div className='space-y-2'>
          <p className='mb-2 text-xs text-gray-500'>Nhấn để mô phỏng quét QR:</p>

          {sampleGuests.map((guest, index) => (
            <Button key={index} onClick={() => simulateQRScan(guest)} variant='outline' size='sm' className='h-auto w-full justify-start p-2 text-left'>
              <User className='mr-2 h-3 w-3 flex-shrink-0' />
              <div className='text-xs'>
                <div className='truncate font-medium'>{guest.name}</div>
                <div className='truncate text-gray-500'>{guest.email}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className='mt-3 border-t pt-2 text-xs text-gray-400'>💡 Chỉ dành cho demo testing</div>
      </Card>
    </div>
  )
}
