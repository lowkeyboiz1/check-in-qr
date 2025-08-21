import { z } from 'zod'

// Guest form validation schema
export const guestFormSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc').min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên không được vượt quá 50 ký tự'),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ').max(100, 'Email không được vượt quá 100 ký tự'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 ký tự')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
})

export type GuestFormData = z.infer<typeof guestFormSchema>

// Search filter validation
export const searchFilterSchema = z.object({
  searchQuery: z.string().max(100, 'Từ khóa tìm kiếm quá dài')
})

export type SearchFilterData = z.infer<typeof searchFilterSchema>
