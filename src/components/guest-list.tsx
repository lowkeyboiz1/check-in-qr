'use client'

import { useState, useRef } from 'react'

import { useAtom, useSetAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuestFilterModal } from '@/components/guest-filter-modal'
import { AddGuestModal } from '@/components/add-guest-modal'
import { FloatingAnimation } from '@/components/floating-animation'
import {
  guestsAtom,
  checkedInCountAtom,
  toggleGuestCheckInAtom,
  guestFiltersAtom,
  showAddGuestModalAtom,
  updateGuestFiltersAtom,
  filteredGuestsAtom,
  Guest,
  addGuestAtom,
  newlyAddedGuestAtom,
  showNewGuestAddedModalAtom,
  triggerFloatingAnimationAtom
} from '@/store/atoms'
import { User, Mail, Phone, UserCheck, UserX, Search, Plus, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const MOCK_DATA_MODE = true

const MOCK_GUESTS: Guest[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    isCheckedIn: true,
    createdAt: '2024-01-15T08:30:00.000Z',
    checkedInAt: '2024-01-15T09:15:00.000Z'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0902345678',
    isCheckedIn: false,
    createdAt: '2024-01-15T09:00:00.000Z',
    checkedInAt: undefined
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    email: 'cuong.le@example.com',
    phone: '0903456789',
    isCheckedIn: true,
    createdAt: '2024-01-15T09:30:00.000Z',
    checkedInAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    phone: '0904567890',
    isCheckedIn: false,
    createdAt: '2024-01-15T10:00:00.000Z',
    checkedInAt: undefined
  },
  {
    id: '5',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@example.com',
    phone: '0905678901',
    isCheckedIn: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    checkedInAt: '2024-01-15T11:00:00.000Z'
  },
  {
    id: '6',
    name: 'Đỗ Thị Phượng',
    email: 'phuong.do@example.com',
    phone: '0906789012',
    isCheckedIn: false,
    createdAt: '2024-01-15T11:00:00.000Z',
    checkedInAt: undefined
  },
  {
    id: '7',
    name: 'Vũ Minh Giang',
    email: 'giang.vu@example.com',
    phone: '0907890123',
    isCheckedIn: true,
    createdAt: '2024-01-15T11:30:00.000Z',
    checkedInAt: '2024-01-15T12:00:00.000Z'
  },
  {
    id: '8',
    name: 'Bùi Thị Hoa',
    email: 'hoa.bui@example.com',
    phone: '0908901234',
    isCheckedIn: false,
    createdAt: '2024-01-15T12:00:00.000Z',
    checkedInAt: undefined
  },
  {
    id: '9',
    name: 'Ngô Văn Inh',
    email: 'inh.ngo@example.com',
    phone: '0909012345',
    isCheckedIn: true,
    createdAt: '2024-01-15T12:30:00.000Z',
    checkedInAt: '2024-01-15T13:00:00.000Z'
  },
  {
    id: '10',
    name: 'Đinh Thị Kim',
    email: 'kim.dinh@example.com',
    phone: '0910123456',
    isCheckedIn: false,
    createdAt: '2024-01-15T13:00:00.000Z',
    checkedInAt: undefined
  }
]

// New Guest Added Modal Component
function NewGuestAddedModal({
  guest,
  isOpen,
  onClose,
  mockGuests,
  setMockGuests,
  handleToggleCheckIn: parentHandleToggleCheckIn
}: {
  guest: Guest | null
  isOpen: boolean
  onClose: () => void
  mockGuests: Guest[]
  setMockGuests: React.Dispatch<React.SetStateAction<Guest[]>>
  handleToggleCheckIn: (guestId: string) => void
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [allGuests] = useAtom(guestsAtom)
  const triggerAnimation = useSetAtom(triggerFloatingAnimationAtom)

  if (!guest) return null

  // Get the current state of the guest (either from atoms or mock data)
  const currentGuest = MOCK_DATA_MODE ? mockGuests.find((g) => g.id === guest.id) || guest : allGuests.find((g) => g.id === guest.id) || guest

  const handleToggleCheckIn = () => {
    setIsCheckingIn(true)

    // Trigger animation if checking in
    if (!currentGuest.isCheckedIn && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      triggerAnimation(rect.left + rect.width / 2, rect.top)
    }

    setTimeout(() => {
      parentHandleToggleCheckIn(guest.id)
      setIsCheckingIn(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

          {/* Modal Content */}
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className='relative z-10 w-full max-w-sm'>
            <Card className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl'>
              {/* Success Header */}
              <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-white'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'>
                    <UserCheck className='h-4 w-4' />
                  </div>
                  <div>
                    <h3 className='font-semibold'>Thêm khách thành công!</h3>
                    <p className='text-sm text-emerald-100'>Khách mới đã được thêm vào danh sách</p>
                  </div>
                </div>
              </div>

              {/* Guest Card Content */}
              <div className='p-4'>
                {/* Header Row - Status and Action */}
                <div className='mb-3 flex items-center justify-between'>
                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                      currentGuest.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${currentGuest.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {currentGuest.isCheckedIn ? 'Đã check-in' : 'Chưa đến'}
                  </div>

                  {/* Check-in Button */}
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      ref={buttonRef}
                      onClick={handleToggleCheckIn}
                      disabled={isCheckingIn}
                      size='sm'
                      className={`touch-target h-9 rounded-xl px-4 font-medium shadow-sm transition-all duration-200 ${
                        currentGuest.isCheckedIn ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                      }`}
                    >
                      {isCheckingIn ? (
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      ) : currentGuest.isCheckedIn ? (
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
                  </motion.div>
                </div>

                {/* Guest Info */}
                <div className='space-y-2'>
                  {/* Name */}
                  <h3 className='text-base leading-snug font-semibold text-gray-900'>{currentGuest.name}</h3>

                  {/* Contact Details */}
                  <div className='space-y-1.5 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 flex-shrink-0 text-gray-400' />
                      <span className='truncate font-medium'>{currentGuest.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 flex-shrink-0 text-gray-400' />
                      <span className='font-medium'>{currentGuest.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className='mt-4 flex justify-end'>
                  <Button onClick={onClose} variant='outline' size='sm' className='rounded-xl px-4'>
                    Đóng
                  </Button>
                </div>
              </div>

              {/* Subtle Status Indicator */}
              <div className={`absolute top-0 right-0 left-0 h-1 ${currentGuest.isCheckedIn ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function GuestList() {
  const [allGuests] = useAtom(guestsAtom)
  const [checkedInCount] = useAtom(checkedInCountAtom)
  const [filters] = useAtom(guestFiltersAtom)
  const [filteredGuests] = useAtom(filteredGuestsAtom)
  const toggleCheckIn = useSetAtom(toggleGuestCheckInAtom)
  const setShowAddModal = useSetAtom(showAddGuestModalAtom)
  const updateFilters = useSetAtom(updateGuestFiltersAtom)
  const addGuest = useSetAtom(addGuestAtom)
  const triggerAnimation = useSetAtom(triggerFloatingAnimationAtom)

  // Handler for adding guests in mock mode
  const handleAddGuest = (guestData: Omit<Guest, 'id' | 'createdAt' | 'isCheckedIn'>) => {
    if (MOCK_DATA_MODE) {
      const newGuest: Guest = {
        ...guestData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        isCheckedIn: false
      }
      setMockGuests((prev) => [...prev, newGuest])
      setNewlyAddedGuest(newGuest)
      setShowNewGuestAddedModal(true)
    } else {
      addGuest(guestData)
    }
  }

  const [newlyAddedGuest, setNewlyAddedGuest] = useAtom(newlyAddedGuestAtom)
  const [showNewGuestAddedModal, setShowNewGuestAddedModal] = useAtom(showNewGuestAddedModalAtom)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [mockGuests, setMockGuests] = useState<Guest[]>(MOCK_GUESTS)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const lastAnimationRef = useRef<Record<string, number>>({})

  // Use mock data if MOCK_DATA_MODE is true, otherwise use atom data
  const actualGuests = MOCK_DATA_MODE ? mockGuests : allGuests

  // Frontend filtering for mock data or use atom filtered data for real data
  const actualFilteredGuests = MOCK_DATA_MODE
    ? mockGuests
        .filter((guest) => {
          // Search filter
          const searchTerm = filters.searchTerm.toLowerCase()
          const matchesSearch = !searchTerm || guest.name.toLowerCase().includes(searchTerm) || guest.email.toLowerCase().includes(searchTerm) || guest.phone.includes(searchTerm)

          // Status filter
          let matchesStatus = true
          if (filters.status === 'checked-in') {
            matchesStatus = guest.isCheckedIn
          } else if (filters.status === 'not-checked-in') {
            matchesStatus = !guest.isCheckedIn
          }

          return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
          let compareValue = 0

          switch (filters.sortField) {
            case 'name':
              compareValue = a.name.localeCompare(b.name, 'vi')
              break
            case 'createdAt':
              compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              break
            case 'checkedInAt':
              const aTime = a.checkedInAt || ''
              const bTime = b.checkedInAt || ''
              compareValue = aTime.localeCompare(bTime)
              break
            case 'status':
              compareValue = Number(b.isCheckedIn) - Number(a.isCheckedIn)
              break
          }

          return filters.sortOrder === 'asc' ? compareValue : -compareValue
        })
    : filteredGuests

  const actualCheckedInCount = MOCK_DATA_MODE ? mockGuests.filter((guest) => guest.isCheckedIn).length : checkedInCount

  const triggerFloatingAnimation = (guestId: string, isCheckingIn: boolean) => {
    if (!isCheckingIn) return // Only animate when checking in, not checking out

    // Prevent duplicate animations within 500ms
    const now = Date.now()
    const lastAnimation = lastAnimationRef.current[guestId] || 0
    if (now - lastAnimation < 500) return

    const buttonElement = buttonRefs.current[guestId]
    if (!buttonElement) return

    const rect = buttonElement.getBoundingClientRect()

    // Update last animation timestamp
    lastAnimationRef.current[guestId] = now

    // Use the new animation trigger atom
    triggerAnimation(rect.left + rect.width / 2, rect.top)
  }

  const handleToggleCheckIn = (guestId: string) => {
    if (MOCK_DATA_MODE) {
      setMockGuests((prevGuests) =>
        prevGuests.map((guest) => {
          if (guest.id === guestId) {
            const isCheckedIn = !guest.isCheckedIn
            // Trigger animation only when checking in
            if (isCheckedIn) {
              !showAddGuestModalAtom && triggerFloatingAnimation(guestId, true)
            }
            return {
              ...guest,
              isCheckedIn,
              checkedInAt: isCheckedIn ? new Date().toISOString() : undefined
            }
          }
          return guest
        })
      )
    } else {
      const guest = actualGuests.find((g) => g.id === guestId)
      if (guest && !guest.isCheckedIn) {
        !showAddGuestModalAtom && triggerFloatingAnimation(guestId, true)
      }
      toggleCheckIn(guestId)
    }
  }

  const handleSearchChange = (value: string) => {
    updateFilters({ searchTerm: value })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.status !== 'all') count++
    if (filters.sortField !== 'name' || filters.sortOrder !== 'asc') count++
    return count
  }

  const clearFilters = () => {
    updateFilters({
      searchTerm: '',
      status: 'all',
      sortField: 'name',
      sortOrder: 'asc'
    })
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  const renderGuestCard = (guest: Guest, index: number) => {
    return (
      <motion.div key={guest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className='relative'>
        <Card className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]'>
          {/* Mobile-Optimized Layout */}
          <div className='p-4'>
            {/* Header Row - Status and Action */}
            <div className='mb-3 flex items-center justify-between'>
              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                  guest.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${guest.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {guest.isCheckedIn ? 'Đã check-in' : 'Chưa đến'}
              </div>

              {/* Mobile Check-in Button */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  ref={(el) => {
                    buttonRefs.current[guest.id] = el
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleCheckIn(guest.id)
                  }}
                  size='sm'
                  className={`touch-target h-9 rounded-xl px-4 font-medium shadow-sm transition-all duration-200 ${
                    guest.isCheckedIn ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                  }`}
                >
                  {guest.isCheckedIn ? (
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
              </motion.div>
            </div>

            {/* Guest Info */}
            <div className='space-y-2'>
              {/* Name */}
              <h3 className='text-base leading-snug font-semibold text-gray-900'>{guest.name}</h3>

              {/* Contact Details */}
              <div className='space-y-1.5 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 flex-shrink-0 text-gray-400' />
                  <span className='truncate font-medium'>{guest.email}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 flex-shrink-0 text-gray-400' />
                  <span className='font-medium'>{guest.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Status Indicator */}
          <div className={`absolute top-0 right-0 left-0 h-1 ${guest.isCheckedIn ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
        </Card>
      </motion.div>
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='h-full bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
        {/* Mobile-Optimized Header */}
        <div className='sticky top-0 z-10 border-b border-gray-200/60 bg-white/95 shadow-sm backdrop-blur-xl'>
          <div className='space-y-4 px-4 py-4'>
            {/* Title and Quick Stats Row */}
            <div className='flex items-start justify-between'>
              <div className='min-w-0 flex-1'>
                <h1 className='text-2xl leading-tight font-bold text-gray-900'>Danh sách khách</h1>
                <p className='mt-0.5 text-sm text-gray-600'>
                  {actualGuests.length} khách • {actualCheckedInCount} đã tham dự
                </p>
              </div>

              {/* Compact Stats */}
              <div className='ml-3 flex gap-2'>
                <div className='rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-3 py-2 text-white shadow-sm'>
                  <div className='text-lg leading-none font-bold'>{actualCheckedInCount}</div>
                  <div className='mt-0.5 text-xs opacity-90'>check-in</div>
                </div>
                <div className='rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-3 py-2 text-white shadow-sm'>
                  <div className='text-lg leading-none font-bold'>{actualGuests.length - actualCheckedInCount}</div>
                  <div className='mt-0.5 text-xs opacity-90'>chờ</div>
                </div>
              </div>
            </div>

            {/* Mobile Search and Actions */}
            <div className='flex gap-2'>
              {/* Enhanced Search Input */}
              <div className='relative flex-1'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Tìm kiếm khách...'
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='h-11 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-500/10'
                />
              </div>

              {/* Enhanced Filter Button with Badge and Active State */}
              <div className='flex gap-1'>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowFilterModal(true)}
                    className={`relative h-11 w-11 rounded-xl p-0 shadow-sm transition-all duration-300 ${
                      hasActiveFilters ? 'border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <SlidersHorizontal className={`h-4 w-4 transition-transform duration-200 ${hasActiveFilters ? 'rotate-12' : ''}`} />

                    {/* Enhanced Badge */}
                    {getActiveFiltersCount() > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-lg ring-2 ring-white'
                      >
                        {getActiveFiltersCount()}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearFilters}
                      className='h-11 w-11 rounded-xl border-amber-200 bg-amber-50 p-0 text-amber-600 shadow-sm transition-all duration-200 hover:bg-amber-100 hover:shadow-md'
                      title='Xóa bộ lọc'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Mobile Add Button */}
              <Button
                size='sm'
                onClick={() => setShowAddModal(true)}
                className='h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-0 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-4 py-3'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='rounded-full bg-blue-500 p-1'>
                  <SlidersHorizontal className='h-3 w-3 text-white' />
                </div>
                <span className='text-sm font-medium text-gray-700'>Bộ lọc đang áp dụng:</span>
              </div>
              <Button onClick={clearFilters} variant='ghost' size='sm' className='h-6 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700'>
                Xóa tất cả
              </Button>
            </div>

            <div className='mt-2 flex flex-wrap gap-1.5'>
              {filters.searchTerm && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm'
                >
                  <Search className='h-3 w-3' />
                  <span className='text-xs'>{filters.searchTerm}</span>
                  <button onClick={() => updateFilters({ searchTerm: '' })} className='ml-1 rounded-full p-0.5 hover:bg-gray-100'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </motion.div>
              )}

              {filters.status !== 'all' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm ${
                    filters.status === 'checked-in' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${filters.status === 'checked-in' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {filters.status === 'checked-in' ? 'Đã check-in' : 'Chưa check-in'}
                  <button onClick={() => updateFilters({ status: 'all' })} className='ml-1 rounded-full p-0.5 hover:bg-white'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </motion.div>
              )}

              {(filters.sortField !== 'name' || filters.sortOrder !== 'asc') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm'
                >
                  <ArrowUpDown className='h-3 w-3' />
                  {filters.sortField === 'name' && 'Tên'}
                  {filters.sortField === 'createdAt' && 'Ngày tạo'}
                  {filters.sortField === 'checkedInAt' && 'Check-in'}
                  {filters.sortField === 'status' && 'Trạng thái'}
                  {filters.sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  <button onClick={() => updateFilters({ sortField: 'name', sortOrder: 'asc' })} className='ml-1 rounded-full p-0.5 hover:bg-white'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </motion.div>
              )}
            </div>

            <div className='mt-2 text-xs text-gray-500'>
              Hiển thị {actualFilteredGuests.length} / {actualGuests.length} khách
            </div>
          </motion.div>
        )}

        {/* Mobile-Optimized Content Area */}
        <div className='space-y-3 px-4 pt-2 pb-6'>
          {/* Guest List */}
          {actualFilteredGuests.length === 0 ? (
            <Card className='rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm'>
              <div className='space-y-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100'>
                  <User className='h-8 w-8 text-gray-400' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-gray-700'>{actualGuests.length === 0 ? 'Chưa có khách mời' : 'Không tìm thấy'}</p>
                  <p className='mt-1 text-sm leading-relaxed text-gray-500'>{actualGuests.length === 0 ? 'Thêm khách mới để bắt đầu' : 'Thử từ khóa khác'}</p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Guest Cards - Mobile Optimized */}
              <div className='space-y-3'>{actualFilteredGuests.map((guest, index) => renderGuestCard(guest, index))}</div>

              {/* Results Info - Only show if no active filters */}
              {!hasActiveFilters && (
                <div className='pt-2 text-center text-xs text-gray-500'>
                  Hiển thị {actualFilteredGuests.length} / {actualGuests.length} khách
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <GuestFilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} />
        <AddGuestModal onAddGuest={MOCK_DATA_MODE ? handleAddGuest : undefined} />
        <NewGuestAddedModal
          guest={newlyAddedGuest}
          isOpen={showNewGuestAddedModal}
          onClose={() => {
            setShowNewGuestAddedModal(false)
            setNewlyAddedGuest(null)
          }}
          mockGuests={mockGuests}
          setMockGuests={setMockGuests}
          handleToggleCheckIn={handleToggleCheckIn}
        />
      </div>
    </ScrollArea>
  )
}
