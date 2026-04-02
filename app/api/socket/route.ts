import { NextResponse } from 'next/server'

// This route provides workspace metadata and health check
// Real-time sync is handled via localStorage + StorageEvent for demo purposes
// In production, replace with Socket.IO server integration

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'SharedSpace API is running',
    realtime: 'localStorage-based sync (demo)',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      status: 'received',
      data: body,
      timestamp: new Date().toISOString()
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
