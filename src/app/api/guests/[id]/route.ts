import { NextRequest, NextResponse } from 'next/server'
import { getGuestsCollection } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing guest ID',
          message: 'ID khách mời là bắt buộc'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Try to find guest by custom id first, then by MongoDB ObjectId
    let guest = await collection.findOne({ id: id })

    // If not found by custom id, try by MongoDB ObjectId (if it's a valid ObjectId)
    if (!guest && ObjectId.isValid(id)) {
      guest = await collection.findOne({ _id: new ObjectId(id) })
    }

    // If still not found, try searching by email
    if (!guest) {
      // Search for email that contains the id (could be part before @ or any email part)
      guest = await collection.findOne({
        email: { $regex: id, $options: 'i' }
      })
    }

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: guest
    })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing guest ID',
          message: 'ID khách mời là bắt buộc'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Find guest by custom id first, then by MongoDB ObjectId
    let guest = await collection.findOne({ id: id })
    let query: any = { id: id }

    if (!guest && ObjectId.isValid(id)) {
      guest = await collection.findOne({ _id: new ObjectId(id) })
      query = { _id: new ObjectId(id) }
    }

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name?.trim()
    if (body.email !== undefined) updateData.email = body.email?.trim().toLowerCase()
    if (body.phone !== undefined) updateData.phone = body.phone?.trim()
    if (body.gender !== undefined) updateData.gender = body.gender?.trim()
    if (body.age !== undefined) updateData.age = body.age?.trim()
    if (body.source !== undefined) updateData.source = body.source?.trim()
    if (body.isCheckedIn !== undefined) {
      updateData.isCheckedIn = body.isCheckedIn
      if (body.isCheckedIn === true && !guest.checkedInAt) {
        updateData.checkedInAt = new Date()
      }
    }

    // Update the guest
    const result = await collection.updateOne(query, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    // Fetch and return the updated guest
    const updatedGuest = await collection.findOne(query)

    return NextResponse.json({
      success: true,
      data: updatedGuest,
      message: 'Cập nhật khách mời thành công'
    })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing guest ID',
          message: 'ID khách mời là bắt buộc'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Find guest by custom id first, then by MongoDB ObjectId
    let guest = await collection.findOne({ id: id })
    let query: any = { id: id }

    if (!guest && ObjectId.isValid(id)) {
      guest = await collection.findOne({ _id: new ObjectId(id) })
      query = { _id: new ObjectId(id) }
    }

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    // Handle check-in/check-out toggle
    if (body.action === 'toggle-checkin') {
      const isCheckingIn = !guest.isCheckedIn

      const updateData: any = {
        isCheckedIn: isCheckingIn,
        updatedAt: new Date()
      }

      // Set checkedInAt when checking in, keep it when checking out
      if (isCheckingIn) {
        updateData.checkedInAt = new Date()
      }

      const result = await collection.updateOne(query, { $set: updateData })

      if (result.matchedCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Guest not found',
            message: 'Không tìm thấy khách mời'
          },
          { status: 404 }
        )
      }

      // Fetch and return the updated guest
      const updatedGuest = await collection.findOne(query)

      return NextResponse.json({
        success: true,
        data: updatedGuest,
        message: isCheckingIn ? 'Check-in thành công' : 'Check-out thành công'
      })
    }

    // Handle other partial updates
    const updateData: any = {
      updatedAt: new Date()
    }

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name?.trim()
    if (body.email !== undefined) updateData.email = body.email?.trim().toLowerCase()
    if (body.phone !== undefined) updateData.phone = body.phone?.trim()
    if (body.gender !== undefined) updateData.gender = body.gender?.trim()
    if (body.age !== undefined) updateData.age = body.age?.trim()
    if (body.source !== undefined) updateData.source = body.source?.trim()

    const result = await collection.updateOne(query, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    // Fetch and return the updated guest
    const updatedGuest = await collection.findOne(query)

    return NextResponse.json({
      success: true,
      data: updatedGuest,
      message: 'Cập nhật khách mời thành công'
    })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing guest ID',
          message: 'ID khách mời là bắt buộc'
        },
        { status: 400 }
      )
    }

    const collection = await getGuestsCollection()

    // Find guest by custom id first, then by MongoDB ObjectId
    let guest = await collection.findOne({ id: id })
    let query: any = { id: id }

    if (!guest && ObjectId.isValid(id)) {
      guest = await collection.findOne({ _id: new ObjectId(id) })
      query = { _id: new ObjectId(id) }
    }

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
          message: 'Không tìm thấy khách mời'
        },
        { status: 404 }
      )
    }

    // Delete the guest
    const result = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete guest',
          message: 'Không thể xóa khách mời'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa khách mời thành công',
      data: guest
    })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete guest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
