import { atom } from 'jotai'

// Guest interface
export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  checkedInAt?: string
  isCheckedIn: boolean
  createdAt: string
}

// QR scan result interface
export interface QRResult {
  type: 'json' | 'url'
  data: string
}

// Filter and sort types
export type FilterStatus = 'all' | 'checked-in' | 'not-checked-in'
export type SortField = 'name' | 'checkedInAt' | 'createdAt' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface GuestFilters {
  status: FilterStatus
  searchTerm: string
  sortField: SortField
  sortOrder: SortOrder
}

// App atoms
export const guestsAtom = atom<Guest[]>([])
export const currentGuestAtom = atom<Guest | null>(null)
export const showGuestModalAtom = atom<boolean>(false)
export const showAddGuestModalAtom = atom<boolean>(false)
export const newlyAddedGuestAtom = atom<Guest | null>(null)
export const showNewGuestAddedModalAtom = atom<boolean>(false)
export const activeTabAtom = atom<'scan' | 'guests' | 'settings'>('scan')
export const isLoadingAtom = atom<boolean>(false)
export const guestFiltersAtom = atom<GuestFilters>({
  status: 'all',
  searchTerm: '',
  sortField: 'name',
  sortOrder: 'asc'
})

// Derived atoms
export const checkedInGuestsAtom = atom((get) => get(guestsAtom).filter((guest) => guest.isCheckedIn))

export const notCheckedInGuestsAtom = atom((get) => get(guestsAtom).filter((guest) => !guest.isCheckedIn))

export const checkedInCountAtom = atom((get) => get(checkedInGuestsAtom).length)

export const filteredGuestsAtom = atom((get) => {
  const guests = get(guestsAtom)
  const filters = get(guestFiltersAtom)

  let filteredGuests = guests

  // Filter by status
  if (filters.status === 'checked-in') {
    filteredGuests = filteredGuests.filter((guest) => guest.isCheckedIn)
  } else if (filters.status === 'not-checked-in') {
    filteredGuests = filteredGuests.filter((guest) => !guest.isCheckedIn)
  }

  // Filter by search term
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filteredGuests = filteredGuests.filter((guest) => guest.name.toLowerCase().includes(searchLower) || guest.email.toLowerCase().includes(searchLower) || guest.phone.includes(searchLower))
  }

  // Sort guests
  filteredGuests.sort((a, b) => {
    let comparison = 0

    switch (filters.sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'vi')
        break
      case 'checkedInAt':
        const aTime = a.checkedInAt || ''
        const bTime = b.checkedInAt || ''
        comparison = aTime.localeCompare(bTime)
        break
      case 'createdAt':
        comparison = a.createdAt.localeCompare(b.createdAt)
        break
      case 'status':
        comparison = Number(b.isCheckedIn) - Number(a.isCheckedIn)
        break
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison
  })

  return filteredGuests
})

// Actions
export const addGuestAtom = atom(null, (get, set, guest: Omit<Guest, 'id' | 'createdAt' | 'isCheckedIn'>) => {
  const newGuest: Guest = {
    ...guest,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    isCheckedIn: false
  }
  set(guestsAtom, (prev) => [...prev, newGuest])
  set(newlyAddedGuestAtom, newGuest)
  set(showNewGuestAddedModalAtom, true)
  return newGuest
})

export const checkInGuestAtom = atom(null, (get, set, guestId: string) => {
  set(guestsAtom, (prev) => prev.map((guest) => (guest.id === guestId ? { ...guest, isCheckedIn: true, checkedInAt: new Date().toISOString() } : guest)))
})

export const checkOutGuestAtom = atom(null, (get, set, guestId: string) => {
  set(guestsAtom, (prev) => prev.map((guest) => (guest.id === guestId ? { ...guest, isCheckedIn: false, checkedInAt: undefined } : guest)))
})

export const toggleGuestCheckInAtom = atom(null, (get, set, guestId: string) => {
  const guests = get(guestsAtom)
  const guest = guests.find((g) => g.id === guestId)
  if (guest) {
    if (guest.isCheckedIn) {
      set(checkOutGuestAtom, guestId)
    } else {
      set(checkInGuestAtom, guestId)
    }
  }
})

export const addCheckedInGuestAtom = atom(null, (get, set, guest: Guest) => {
  const existingGuests = get(guestsAtom)
  const existingGuest = existingGuests.find((g) => g.email === guest.email)

  if (existingGuest) {
    // If guest exists, just check them in
    set(checkInGuestAtom, existingGuest.id)
  } else {
    // Add new guest and check them in
    const newGuest: Guest = {
      ...guest,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isCheckedIn: true,
      checkedInAt: new Date().toISOString()
    }
    set(guestsAtom, (prev) => [...prev, newGuest])
  }

  set(currentGuestAtom, null)
  set(showGuestModalAtom, false)
})

export const setCurrentGuestAtom = atom(null, (get, set, guest: Guest | null) => {
  set(currentGuestAtom, guest)
  set(showGuestModalAtom, !!guest)
})

export const updateGuestFiltersAtom = atom(null, (get, set, filters: Partial<GuestFilters>) => {
  set(guestFiltersAtom, (prev) => ({ ...prev, ...filters }))
})
