import { NextResponse } from 'next/server'

export async function GET() {
  const userData = {
    id: '10',
    name: 'Tôi hạnh phúc',
    email: 'happy@example.com',
    phone: '0123456789',
    isCheckedIn: false,
    createdAt: '2024-01-15T13:00:00.000Z',
    checkedInAt: undefined
  }

  return NextResponse.json(userData)
}
