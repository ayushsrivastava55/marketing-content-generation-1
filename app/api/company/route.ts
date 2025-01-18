import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { Company } from '@/models/Company'
import { auth } from '@/auth'

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(process.env.MONGODB_URI!)
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectDB()

    const data = await req.json()
    const userId = session.user.id

    // Update or create company profile
    const company = await Company.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { upsert: true, new: true }
    )

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error in company API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectDB()

    const userId = session.user.id
    const company = await Company.findOne({ userId })

    if (!company) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error in company API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
