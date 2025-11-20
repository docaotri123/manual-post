import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { filename, data } = await request.json()
    
    const base64Data = data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const timestamp = Date.now()
    const ext = filename.split('.').pop()
    const newFilename = `${timestamp}.${ext}`
    const filepath = path.join(uploadsDir, newFilename)
    
    fs.writeFileSync(filepath, buffer)
    
    return NextResponse.json({ 
      url: `/uploads/${newFilename}`,
      filename: newFilename
    })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
