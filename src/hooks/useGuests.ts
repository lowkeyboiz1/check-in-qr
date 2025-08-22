import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { instance } from '@/services/api/instance'
import { Guest, CreateGuestData } from '@/lib/models/Guest'

// API response types
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  errors?: string[]
  count?: number
}

interface ImportResult {
  totalProcessed: number
  successCount: number
  errorCount: number
  insertedCount: number
  errors: string[]
}

interface CheckInByInfoResult {
  success: boolean
  data: Guest
  message: string
  alreadyCheckedIn: boolean
}

interface CheckInByInfoData {
  name?: string
  email?: string
  phone?: string
}

// API functions
const guestApi = {
  // Get all guests
  getGuests: async (): Promise<Guest[]> => {
    const response = await instance.get<ApiResponse<Guest[]>>('/api/guests')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch guests')
    }
    return response.data.data
  },

  // Add new guest
  addGuest: async (guestData: CreateGuestData): Promise<Guest> => {
    const response = await instance.post<ApiResponse<Guest>>('/api/guests', guestData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add guest')
    }
    return response.data.data
  },

  // Toggle check-in status
  toggleCheckIn: async (guestId: string): Promise<Guest> => {
    const response = await instance.patch<ApiResponse<Guest>>(`/api/guests/${guestId}`, {
      action: 'toggle-checkin'
    })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to toggle check-in status')
    }
    return response.data.data
  },

  // Update guest (general update)
  updateGuest: async (guestId: string, updateData: Partial<CreateGuestData>): Promise<Guest> => {
    const response = await instance.patch<ApiResponse<Guest>>(`/api/guests/${guestId}`, updateData)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update guest')
    }
    return response.data.data
  },

  // Check-in by guest info (from QR code)
  checkInByInfo: async (guestInfo: CheckInByInfoData): Promise<CheckInByInfoResult> => {
    const response = await instance.post<ApiResponse<CheckInByInfoResult>>('/api/guests/checkin-by-info', guestInfo)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to check-in guest')
    }
    return response.data.data
  },

  // Import CSV
  importCSV: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await instance.post<ApiResponse<ImportResult>>('/api/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to import CSV')
    }

    return response.data.data
  }
}

// Query keys
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters: string) => [...guestKeys.lists(), { filters }] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: string) => [...guestKeys.details(), id] as const
}

// Custom hooks
export function useGuests() {
  return useQuery({
    queryKey: guestKeys.lists(),
    queryFn: guestApi.getGuests,
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for better data freshness
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true
  })
}

export function useAddGuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestApi.addGuest,
    onSuccess: (newGuest) => {
      // Update the guests list cache
      queryClient.setQueryData<Guest[]>(guestKeys.lists(), (oldGuests) => {
        if (!oldGuests) return [newGuest]
        return [...oldGuests, newGuest]
      })

      // Invalidate and refetch guests list to ensure consistency
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    },
    onError: (error) => {
      console.error('Error adding guest:', error)
    }
  })
}

// Hook for optimistic updates
export function useAddGuestOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestApi.addGuest,
    onMutate: async (newGuestData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.lists() })

      // Snapshot the previous value
      const previousGuests = queryClient.getQueryData<Guest[]>(guestKeys.lists())

      // Optimistically update to the new value
      const optimisticGuest: Guest = {
        id: `temp-${Date.now()}`,
        name: newGuestData.name,
        email: newGuestData.email,
        phone: newGuestData.phone,
        isCheckedIn: false,
        createdAt: new Date()
      }

      queryClient.setQueryData<Guest[]>(guestKeys.lists(), (oldGuests) => {
        if (!oldGuests) return [optimisticGuest]
        return [...oldGuests, optimisticGuest]
      })

      // Return a context object with the snapshotted value
      return { previousGuests }
    },
    onError: (err, newGuestData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGuests) {
        queryClient.setQueryData(guestKeys.lists(), context.previousGuests)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    }
  })
}

export function useToggleCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestApi.toggleCheckIn,
    onMutate: async (guestId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.lists() })

      // Snapshot the previous value
      const previousGuests = queryClient.getQueryData<Guest[]>(guestKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData<Guest[]>(guestKeys.lists(), (oldGuests) => {
        if (!oldGuests) return []

        return oldGuests.map((guest) => {
          if (guest.id === guestId) {
            const isCheckingIn = !guest.isCheckedIn
            return {
              ...guest,
              isCheckedIn: isCheckingIn,
              checkedInAt: isCheckingIn ? new Date() : guest.checkedInAt,
              updatedAt: new Date()
            }
          }
          return guest
        })
      })

      // Return a context object with the snapshotted value
      return { previousGuests }
    },
    onError: (err, guestId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGuests) {
        queryClient.setQueryData(guestKeys.lists(), context.previousGuests)
      }
      console.error('Error toggling check-in:', err)
    },
    onSuccess: () => {
      // Only invalidate on success to reduce unnecessary network calls
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    },
    // Removed onSettled to prevent double invalidation
    retry: 1, // Only retry once on failure
    retryDelay: 1000 // Wait 1 second before retry
  })
}

export function useUpdateGuest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ guestId, updateData }: { guestId: string; updateData: Partial<CreateGuestData> }) => guestApi.updateGuest(guestId, updateData),
    onSuccess: (updatedGuest) => {
      // Update the guests list cache
      queryClient.setQueryData<Guest[]>(guestKeys.lists(), (oldGuests) => {
        if (!oldGuests) return [updatedGuest]
        return oldGuests.map((guest) => (guest.id === updatedGuest.id ? updatedGuest : guest))
      })

      // Invalidate and refetch guests list to ensure consistency
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    },
    onError: (error) => {
      console.error('Error updating guest:', error)
    }
  })
}

export function useCheckInByInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestApi.checkInByInfo,
    onSuccess: (result) => {
      // Update the guests list cache
      queryClient.setQueryData<Guest[]>(guestKeys.lists(), (oldGuests) => {
        if (!oldGuests) return [result.data]
        return oldGuests.map((guest) => (guest.id === result.data.id ? result.data : guest))
      })

      // Invalidate and refetch guests list to ensure consistency
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    },
    onError: (error) => {
      console.error('Error checking in by info:', error)
    }
  })
}

export function useImportCSV() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestApi.importCSV,
    onSuccess: () => {
      // Invalidate and refetch guests list after successful import
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
    },
    onError: (error) => {
      console.error('Error importing CSV:', error)
    }
  })
}
