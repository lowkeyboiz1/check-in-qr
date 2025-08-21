import { NextResponse } from 'next/server'

export async function GET() {
  const userData = {
    name: 'Nguyễn Văn A',
    email: 'vana@example.com',
    phone: '0912345678'
  }

  return NextResponse.json(userData)
}
