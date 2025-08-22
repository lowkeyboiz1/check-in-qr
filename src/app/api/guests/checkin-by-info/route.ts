import { NextRequest, NextResponse } from 'next/server'
import { getGuestsCollection } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name && !email && !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing guest information',
          message: 'Cần ít nhất một thông tin để tìm khách (tên, email hoặc số điện thoại)'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Try to find guest by email first (most unique), then by phone, then by name
    let guest = null

    if (email) {
      guest = await collection.findOne({
        email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
      })
    }

    if (!guest && phone) {
      // Clean phone number for comparison
      const cleanPhone = phone.replace(/\s/g, '').replace(/^'/, '').replace(/^\+84/, '0')
      guest = await collection.findOne({
        phone: { $regex: new RegExp(`^${cleanPhone}$`) }
      })
    }

    if (!guest && name) {
      guest = await collection.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      })
    }

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời với thông tin đã cung cấp'
        },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (guest.isCheckedIn) {
      return NextResponse.json({
        success: true,
        data: guest,
        message: 'Khách đã check-in từ trước',
        alreadyCheckedIn: true
      })
    }

    // Perform check-in
    const updateData = {
      isCheckedIn: true,
      checkedInAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.updateOne({ _id: guest._id }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check-in',
          message: 'Không thể thực hiện check-in'
        },
        { status: 500 }
      )
    }

    // Fetch and return the updated guest
    const updatedGuest = await collection.findOne({ _id: guest._id })

    return NextResponse.json({
      success: true,
      data: updatedGuest,
      message: 'Check-in thành công',
      alreadyCheckedIn: false
    })
  } catch (error) {
    console.error('Error checking in guest by info:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check-in guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
