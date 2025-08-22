import { ObjectId } from 'mongodb'

export interface Guest {
  _id?: ObjectId
  id: string
  name?: string
  email?: string
  phone?: string
  gender?: string
  age?: string
  source?: string
  isCheckedIn: boolean
  createdAt: Date
  checkedInAt?: Date
  updatedAt?: Date
}

export interface CreateGuestData {
  name?: string
  email?: string
  phone?: string
  gender?: string
  age?: string
  source?: string
}

export interface UpdateGuestData {
  name?: string
  email?: string
  phone?: string
  gender?: string
  age?: string
  source?: string
  isCheckedIn?: boolean
  checkedInAt?: Date
}

// Validation functions
export function validateGuestData(data: CreateGuestData): string[] {
  const errors: string[] = []

  // Optional validation - only validate if data exists
  if (data.email && data.email.trim().length > 0 && !isValidEmail(data.email)) {
    errors.push('Email không hợp lệ')
  }

  if (data.phone && data.phone.trim().length > 0 && !isValidPhone(data.phone)) {
    errors.push('Số điện thoại không hợp lệ')
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  // Vietnamese phone number format - handle both local and international format
  const cleanPhone = phone.replace(/\s/g, '').replace(/^'/, '').replace(/^\+84/, '0')
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
  return phoneRegex.test(cleanPhone)
}

// Helper function to generate unique ID
export function generateGuestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
