import { NextRequest, NextResponse } from 'next/server'
import { getGuestsCollection } from '@/lib/db'
import { CreateGuestData, validateGuestData, generateGuestId } from '@/lib/models/Guest'

export async function GET() {
  try {
    const collection = await getGuestsCollection()

    // Lấy tất cả guests từ database
    const guests = await collection.find({}).toArray()

    return NextResponse.json({
      success: true,
      data: guests,
      count: guests.length
    })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch guests',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const guestData: CreateGuestData = {
      name: body.name?.trim(),
      email: body.email?.trim().toLowerCase(),
      phone: body.phone?.trim()
    }

    // Validate guest data
    const validationErrors = validateGuestData(guestData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationErrors.join(', '),
          errors: validationErrors
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Check if email already exists
    const existingGuest = await collection.findOne({ email: guestData.email })
    if (existingGuest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
          message: 'Email này đã được sử dụng'
        },
        { status: 409 }
      )
    }

    // Create new guest
    const newGuest = {
      id: generateGuestId(),
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
      isCheckedIn: false,
      createdAt: new Date()
    }

    const result = await collection.insertOne(newGuest)

    if (!result.insertedId) {
      throw new Error('Failed to insert guest')
    }

    // Return the created guest
    const createdGuest = await collection.findOne({ _id: result.insertedId })

    return NextResponse.json(
      {
        success: true,
        data: createdGuest,
        message: 'Thêm khách mời thành công'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
