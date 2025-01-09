import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { Company } from '@/models/Company'

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(process.env.MONGODB_URI!)
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const data = await req.json()

    // Update or create company profile
    const company = await Company.findOneAndUpdate(
      { userId: data.userId },
      { ...data },
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
    await connectDB()

    const data = await req.json()
    const company = await Company.findOne({ userId: data.userId })

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
