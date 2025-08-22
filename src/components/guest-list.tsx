'use client'

import { useState, useRef, useMemo, useCallback, memo, useContext, useEffect } from 'react'
import React from 'react'

import { useAtom, useSetAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuestFilterModal } from '@/components/guest-filter-modal'
import { AddGuestModal } from '@/components/add-guest-modal'
import { FloatingAnimation } from '@/components/floating-animation'
import {
  toggleGuestCheckInAtom,
  guestFiltersAtom,
  showAddGuestModalAtom,
  updateGuestFiltersAtom,
  newlyAddedGuestAtom,
  showNewGuestAddedModalAtom,
  triggerFloatingAnimationAtom,
  Guest as AtomGuest
} from '@/store/atoms'
import { User, Mail, Phone, UserCheck, UserX, Search, Plus, SlidersHorizontal, X, ArrowUpDown, RefreshCw } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGuests, useToggleCheckIn } from '@/hooks/useGuests'
import { Guest } from '@/lib/models/Guest'
import { FixedSizeList as List } from 'react-window'
import { OptimizedSearchInput } from '@/components/optimized-search-input'

// Helper to convert between Guest types
function convertGuestTypes(guest: AtomGuest | Guest): Guest {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    isCheckedIn: guest.isCheckedIn,
    createdAt: typeof guest.createdAt === 'string' ? new Date(guest.createdAt) : guest.createdAt,
    checkedInAt: guest.checkedInAt ? (typeof guest.checkedInAt === 'string' ? new Date(guest.checkedInAt) : guest.checkedInAt) : undefined
  }
}

// Virtual List Row Component for large guest lists
const VirtualGuestRow = memo(function VirtualGuestRow({
  index,
  style,
  data
}: {
  index: number
  style: React.CSSProperties
  data: { guests: Guest[]; handleToggleCheckIn: (id: string) => Promise<void>; buttonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>> }
}) {
  const guest = data.guests[index]
  const { handleToggleCheckIn, buttonRefs } = data
  const [isLoading, setIsLoading] = useState(false)

  const handleCardCheckIn = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isLoading) return

      setIsLoading(true)
      try {
        await handleToggleCheckIn(guest.id)
      } finally {
        setIsLoading(false)
      }
    },
    [guest.id, handleToggleCheckIn, isLoading]
  )

  return (
    <div style={style} className='px-4 pb-4'>
      <Card className='relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
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
              ref={(el) => {
                buttonRefs.current[guest.id] = el
              }}
              onClick={handleCardCheckIn}
              disabled={isLoading}
              size='sm'
              className={`touch-target h-10 rounded-xl px-4 font-medium shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
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
    </div>
  )
})

// Virtualized Guest List Component
const VirtualizedGuestList = memo(function VirtualizedGuestList({ guests }: { guests: Guest[] }) {
  const context = useContext(GuestListContext)
  const { handleToggleCheckIn } = context
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [windowHeight, setWindowHeight] = useState(600)

  // Handle window resize for dynamic height
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight)

      const handleResize = () => {
        setWindowHeight(window.innerHeight)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const itemData = useMemo(
    () => ({
      guests,
      handleToggleCheckIn,
      buttonRefs
    }),
    [guests, handleToggleCheckIn]
  )

  return (
    <List
      height={Math.min(600, windowHeight - 200)} // Dynamic height based on screen
      width='100%' // Required width property
      itemCount={guests.length}
      itemSize={180} // Increased height per guest card to prevent overlapping
      itemData={itemData}
      overscanCount={3} // Reduced overscan for better performance
    >
      {VirtualGuestRow}
    </List>
  )
})

// New Guest Added Modal Component - Memoized for performance
const NewGuestAddedModal = memo(function NewGuestAddedModal({
  guest,
  isOpen,
  onClose,
  handleToggleCheckIn: parentHandleToggleCheckIn
}: {
  guest: AtomGuest | null
  isOpen: boolean
  onClose: () => void
  handleToggleCheckIn: (guestId: string) => Promise<void>
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const { data: allGuests = [] } = useGuests()
  const triggerAnimation = useSetAtom(triggerFloatingAnimationAtom)

  // Get the current state of the guest from React Query data or use the atom guest
  const reactQueryGuest = allGuests.find((g: Guest) => g.id === guest?.id)
  const currentGuest = reactQueryGuest || (guest ? convertGuestTypes(guest) : null)

  const handleToggleCheckIn = useCallback(async () => {
    if (!guest) return

    setIsCheckingIn(true)

    // Trigger animation if checking in
    if (currentGuest && !currentGuest.isCheckedIn && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      triggerAnimation(rect.left + rect.width / 2, rect.top)
    }

    try {
      await parentHandleToggleCheckIn(guest.id)
    } catch (error) {
      console.error('Failed to toggle check-in in modal:', error)
    } finally {
      setIsCheckingIn(false)
    }
  }, [currentGuest, guest, parentHandleToggleCheckIn, triggerAnimation])

  if (!guest || !currentGuest) return null

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

              {/* Guest Card Content - Improved spacing */}
              <div className='p-5'>
                {/* Header Row - Status and Action */}
                <div className='mb-4 flex items-center justify-between'>
                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                      currentGuest.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${currentGuest.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {currentGuest.isCheckedIn ? 'Đã check-in' : 'Chưa đến'}
                  </div>

                  {/* Check-in Button with Loading */}
                  <Button
                    ref={buttonRef}
                    onClick={handleToggleCheckIn}
                    disabled={isCheckingIn}
                    size='sm'
                    className={`touch-target h-10 rounded-xl px-4 font-medium shadow-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
                      currentGuest.isCheckedIn ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                    }`}
                  >
                    {isCheckingIn ? (
                      <div className='flex items-center'>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Đang...
                      </div>
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
                </div>

                {/* Guest Info - Better spacing */}
                <div className='space-y-3'>
                  {/* Name */}
                  <h3 className='text-lg leading-snug font-semibold text-gray-900'>{currentGuest.name}</h3>

                  {/* Contact Details */}
                  <div className='space-y-2 text-sm text-gray-600'>
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
})

// Context for sharing handlers with virtual list
const GuestListContext = React.createContext<{
  handleToggleCheckIn: (guestId: string) => Promise<void>
}>({
  handleToggleCheckIn: async () => {
    // Default implementation
  }
})

export function GuestList() {
  // React Query
  const { data: allGuests = [], isLoading, isError, error, refetch } = useGuests()
  const toggleCheckInMutation = useToggleCheckIn()

  // Jotai atoms
  const [filters] = useAtom(guestFiltersAtom)
  const setShowAddModal = useSetAtom(showAddGuestModalAtom)
  const updateFilters = useSetAtom(updateGuestFiltersAtom)
  const triggerAnimation = useSetAtom(triggerFloatingAnimationAtom)

  const [newlyAddedGuest, setNewlyAddedGuest] = useAtom(newlyAddedGuestAtom)
  const [showNewGuestAddedModal, setShowNewGuestAddedModal] = useAtom(showNewGuestAddedModalAtom)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const lastAnimationRef = useRef<Record<string, number>>({})

  // Calculate filtered guests and stats using React Query data
  const { filteredGuests, checkedInCount } = useMemo(() => {
    if (!allGuests) return { filteredGuests: [], checkedInCount: 0 }

    let filtered = [...allGuests]

    // Filter by status
    if (filters.status === 'checked-in') {
      filtered = filtered.filter((guest) => guest.isCheckedIn)
    } else if (filters.status === 'not-checked-in') {
      filtered = filtered.filter((guest) => !guest.isCheckedIn)
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter((guest) => guest.name?.toLowerCase().includes(searchLower) || guest.email?.toLowerCase().includes(searchLower) || guest.phone?.includes(searchLower))
    }

    // Sort guests
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortField) {
        case 'name':
          comparison = a.name?.localeCompare(b.name || '', 'vi') || 0
          break
        case 'checkedInAt':
          const aTime = a.checkedInAt?.toString() || ''
          const bTime = b.checkedInAt?.toString() || ''
          comparison = aTime.localeCompare(bTime)
          break
        case 'createdAt':
          comparison = a.createdAt.toString().localeCompare(b.createdAt.toString())
          break
        case 'status':
          comparison = Number(b.isCheckedIn) - Number(a.isCheckedIn)
          break
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    const checkedIn = allGuests.filter((guest) => guest.isCheckedIn).length

    return { filteredGuests: filtered, checkedInCount: checkedIn }
  }, [allGuests, filters])

  // Use processed data
  const actualGuests = allGuests
  const actualFilteredGuests = filteredGuests
  const actualCheckedInCount = checkedInCount

  const triggerFloatingAnimation = useCallback(
    (guestId: string, isCheckingIn: boolean) => {
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
    },
    [triggerAnimation]
  )

  const handleToggleCheckIn = useCallback(
    async (guestId: string) => {
      const guest = actualGuests.find((g) => g.id === guestId)
      if (guest && !guest.isCheckedIn) {
        triggerFloatingAnimation(guestId, true)
      }

      try {
        await toggleCheckInMutation.mutateAsync(guestId)
      } catch (error) {
        console.error('Failed to toggle check-in:', error)
        // Error is already handled by the mutation's onError
      }
    },
    [actualGuests, triggerFloatingAnimation, toggleCheckInMutation]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      updateFilters({ searchTerm: value })
    },
    [updateFilters]
  )

  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.status !== 'all') count++
    if (filters.sortField !== 'name' || filters.sortOrder !== 'asc') count++
    return count
  }, [filters])

  const clearFilters = useCallback(() => {
    updateFilters({
      searchTerm: '',
      status: 'all',
      sortField: 'name',
      sortOrder: 'asc'
    })
  }, [updateFilters])

  const hasActiveFilters = useMemo(() => getActiveFiltersCount() > 0, [getActiveFiltersCount])

  // Memoized Guest Card Component for performance
  const GuestCard = memo(function GuestCard({ guest, index }: { guest: Guest; index: number }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleCardCheckIn = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isLoading) return // Prevent spam clicking

        setIsLoading(true)
        try {
          await handleToggleCheckIn(guest.id)
        } finally {
          setIsLoading(false)
        }
      },
      [guest.id, isLoading]
    )

    return (
      <Card className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
        {/* Layout - More spacious padding */}
        <div className='p-6'>
          {/* Header Row - Status and Action - Better spacing */}
          <div className='mb-4 flex items-center justify-between'>
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                guest.isCheckedIn ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-100 text-amber-700'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${guest.isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {guest.isCheckedIn ? 'Đã check-in' : 'Chưa đến'}
            </div>

            {/* Check-in Button with Loading */}
            <Button
              ref={(el) => {
                buttonRefs.current[guest.id] = el
              }}
              onClick={handleCardCheckIn}
              disabled={isLoading}
              size='sm'
              className={`h-11 rounded-xl px-5 font-medium shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                guest.isCheckedIn ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
              }`}
            >
              {isLoading ? (
                <div className='flex items-center'>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  {guest.isCheckedIn ? 'Đang...' : 'Đang...'}
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

          {/* Guest Info - Improved spacing */}
          <div className='space-y-3'>
            {/* Name */}
            <h3 className='text-lg leading-snug font-semibold text-gray-900'>{guest.name || ''}</h3>

            {/* Contact Details */}
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

        {/* Subtle Status Indicator - Slightly thicker */}
        <div className={`absolute top-0 right-0 left-0 h-1.5 ${guest.isCheckedIn ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
      </Card>
    )
  })

  return (
    <ScrollArea className='h-full'>
      <div className='h-full bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
        {/* Header */}
        <div className='sticky top-0 z-10 border-b border-gray-200/60 bg-white/95 shadow-sm backdrop-blur-xl'>
          <div className='space-y-4 px-6 py-6'>
            {/* Title and Quick Stats Row */}
            <div className='flex items-start justify-between'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl leading-tight font-bold text-gray-900'>Danh sách khách</h1>
                  {isLoading && <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />}
                  {isError && (
                    <Button variant='ghost' size='sm' onClick={() => refetch()} className='h-6 px-2 text-red-600 hover:bg-red-50'>
                      <RefreshCw className='mr-1 h-3 w-3' />
                      Thử lại
                    </Button>
                  )}
                </div>
                <p className='mt-0.5 text-sm text-gray-600'>{isLoading ? 'Đang tải...' : `${actualGuests.length} khách • ${actualCheckedInCount} đã tham dự`}</p>
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

            {/* Search and Actions */}
            <div className='flex gap-3'>
              {/* Enhanced Search Input with Optimized Debouncing */}
              <OptimizedSearchInput
                onSearch={handleSearchChange}
                placeholder='Tìm kiếm khách...'
                className='flex-1'
                debounceMs={150} // Reduced debounce for faster response
              />

              {/* Enhanced Filter Button with Badge and Active State */}
              <div className='flex gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowFilterModal(true)}
                  className={`relative h-11 w-11 rounded-xl p-0 shadow-sm transition-all duration-200 active:scale-95 ${
                    hasActiveFilters ? 'border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-lg' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <SlidersHorizontal className={`h-4 w-4 transition-transform duration-200 ${hasActiveFilters ? 'rotate-12' : ''}`} />

                  {/* Enhanced Badge */}
                  {getActiveFiltersCount() > 0 && (
                    <span className='absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-xs font-bold text-white shadow-lg ring-2 ring-white'>
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </Button>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={clearFilters}
                    className='h-11 w-11 rounded-xl border-amber-200 bg-amber-50 p-0 text-amber-600 shadow-sm transition-all duration-200 hover:bg-amber-100 hover:shadow-md active:scale-95'
                    title='Xóa bộ lọc'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {/* Add Button */}
              <Button
                size='sm'
                onClick={() => setShowAddModal(true)}
                className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-0 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
              >
                <Plus className='h-5 w-5' />
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
            className='border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-6 py-4'
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
                <div className='inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm'>
                  <Search className='h-3 w-3' />
                  <span className='text-xs'>{filters.searchTerm}</span>
                  <button onClick={() => updateFilters({ searchTerm: '' })} className='ml-1 rounded-full p-0.5 hover:bg-gray-100'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </div>
              )}

              {filters.status !== 'all' && (
                <div
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm ${
                    filters.status === 'checked-in' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${filters.status === 'checked-in' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {filters.status === 'checked-in' ? 'Đã check-in' : 'Chưa check-in'}
                  <button onClick={() => updateFilters({ status: 'all' })} className='ml-1 rounded-full p-0.5 hover:bg-white'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </div>
              )}

              {(filters.sortField !== 'name' || filters.sortOrder !== 'asc') && (
                <div className='inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm'>
                  <ArrowUpDown className='h-3 w-3' />
                  {filters.sortField === 'name' && 'Tên'}
                  {filters.sortField === 'createdAt' && 'Ngày tạo'}
                  {filters.sortField === 'checkedInAt' && 'Check-in'}
                  {filters.sortField === 'status' && 'Trạng thái'}
                  {filters.sortOrder === 'asc' ? ' ↑' : ' ↓'}
                  <button onClick={() => updateFilters({ sortField: 'name', sortOrder: 'asc' })} className='ml-1 rounded-full p-0.5 hover:bg-white'>
                    <X className='h-2.5 w-2.5' />
                  </button>
                </div>
              )}
            </div>

            <div className='mt-2 text-xs text-gray-500'>
              Hiển thị {actualFilteredGuests.length} / {actualGuests.length} khách
            </div>
          </motion.div>
        )}

        {/* Content Area - More spacious layout */}
        <div className='flex flex-col gap-6 px-6 pt-6 pb-12'>
          {/* Error State */}
          {isError && (
            <Card className='rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm'>
              <div className='space-y-4'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100'>
                  <X className='h-8 w-8 text-red-400' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-red-700'>Không thể tải danh sách khách</p>
                  <p className='mt-1 text-sm leading-relaxed text-red-600'>{error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi tải dữ liệu'}</p>
                  <Button onClick={() => refetch()} className='mt-3 bg-red-600 hover:bg-red-700'>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Thử lại
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && !isError && (
            <div className='flex flex-col gap-4'>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className='relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                  <div className='p-5'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='h-7 w-24 animate-pulse rounded-full bg-gray-200'></div>
                      <div className='h-10 w-24 animate-pulse rounded-xl bg-gray-200'></div>
                    </div>
                    <div className='space-y-3'>
                      <div className='h-6 w-3/4 animate-pulse rounded bg-gray-200'></div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
                          <div className='h-4 w-1/2 animate-pulse rounded bg-gray-200'></div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
                          <div className='h-4 w-1/3 animate-pulse rounded bg-gray-200'></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='absolute top-0 right-0 left-0 h-1.5 animate-pulse bg-gray-200'></div>
                </Card>
              ))}
            </div>
          )}

          {/* Guest List */}
          {!isLoading && !isError && actualFilteredGuests.length === 0 ? (
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
          ) : !isLoading && !isError && actualFilteredGuests.length > 0 ? (
            <>
              {/* Guest Cards - More spacious layout */}
              <GuestListContext.Provider value={{ handleToggleCheckIn }}>
                <div className='flex flex-col gap-6'>
                  {actualFilteredGuests.length > 50 ? (
                    // For large lists, implement virtual scrolling
                    <VirtualizedGuestList guests={actualFilteredGuests} />
                  ) : (
                    // For smaller lists, render normally
                    actualFilteredGuests.map((guest, index) => <GuestCard key={guest.id} guest={guest} index={index} />)
                  )}
                </div>
              </GuestListContext.Provider>

              {/* Results Info - Only show if no active filters */}
              {!hasActiveFilters && actualFilteredGuests.length > 0 && (
                <div className='rounded-xl bg-gray-50 py-3 pt-4 text-center text-sm text-gray-500'>
                  📊 Hiển thị <span className='font-semibold text-gray-700'>{actualFilteredGuests.length}</span> / <span className='font-semibold text-gray-700'>{actualGuests.length}</span> khách
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modals */}
        <GuestFilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} />
        <AddGuestModal />
        <NewGuestAddedModal
          guest={newlyAddedGuest}
          isOpen={showNewGuestAddedModal}
          onClose={() => {
            setShowNewGuestAddedModal(false)
            setNewlyAddedGuest(null)
          }}
          handleToggleCheckIn={handleToggleCheckIn}
        />
      </div>
    </ScrollArea>
  )
}
